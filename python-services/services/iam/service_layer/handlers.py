import uuid
from datetime import datetime

from sqlalchemy import or_

from modules.airtable.airtable_api_client import AirtableAPIClient
from modules.airtable.config import get_config as get_airtable_config
from modules.airtable.enum import BaseEnum, TableEnum
from modules.domain.types import cast_string_to_date
from modules.pubsub.event import EventPublisher
from modules.service_layer.message_bus import MessageBus
from modules.utils.user import (
    PersonSchema,
    get_full_person_name,
    get_normalized_phone_number,
    split_name,
)
from services.iam.domain import command, event
from services.iam.domain.models.end_user import EndUser
from services.iam.domain.models.end_user_access_token import EndUserAccessToken
from services.iam.domain.models.internal_user_access_token import (
    InternalUserAccessToken,
)
from services.iam.domain.models.otp_token import OTPToken
from services.iam.domain.models.team import Team
from services.iam.domain.models.team_internal_user import TeamInternalUser
from services.iam.domain.models.team_permission import TeamPermission
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork
from services.iam.utils import get_hashed_password


class InvalidOwner(Exception):
    pass


class InvalidOneTimePassword(Exception):
    pass


class InvalidCredential(Exception):
    pass


class MultipleEndUser(Exception):
    pass


class UnprocessableAirtableEndUser(Exception):
    pass


async def update_organization_by_owner(
    command: command.UpdateOrganizationByOwner,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        organization = await uow.organization_repository.get_by_reference(
            command.organization_reference
        )
        if (
            organization.registered_representative_internal_user_reference
            != command.internal_user_reference
        ):
            raise InvalidOwner()

        for k, v in command.payload.dict().items():
            if v is not None:
                setattr(organization, k, v)
        await uow.commit()


async def login_internal_user(
    command: command.LoginInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        internal_users = await uow.internal_user_repository.get_all_by(
            email_address=command.payload.email_address
        )
        if len(internal_users) != 1:
            raise InvalidCredential("Invalid login credentials")

        internal_user = internal_users[0]
        hashed_password = get_hashed_password(
            command.payload.password, internal_user.password_salt
        )
        if hashed_password != internal_user.hashed_password:
            raise InvalidCredential("Invalid login credentials")

        internal_user_access_token = InternalUserAccessToken(
            internal_user=internal_user,
            value=command.request_access_token_value,
            expiration_time=datetime.utcnow() + command.request_access_token_token_age,
            is_active=True,
        )
        await uow.internal_user_access_token_repository.add(internal_user_access_token)
        await uow.commit()


async def logout_internal_user(
    command: command.LogoutInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        internal_user_access_tokens = (
            await uow.internal_user_access_token_repository.get_all_by(
                value=command.access_token_value
            )
        )
        for iuat in internal_user_access_tokens:
            iuat.is_active = False
        await uow.commit()


async def create_end_user_signup_intent(
    cmd: command.CreateEndUserSignupIntent,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        otp_token = OTPToken(
            serial_number=cmd.request_token_serial_number,
            value=cmd.request_token_otp_value,
            state=cmd.payload.phone_number,
            expiration_time=datetime.utcnow() + cmd.request_token_token_age,
            is_active=True,
        )
        await uow.otp_token_repository.add(otp_token)
        await uow.commit()
        bus.push_event(
            event.EndUserSignupIntentCreated(
                phone_number=cmd.payload.phone_number,
                email_address=cmd.payload.email_address,
                otp_value=cmd.request_token_otp_value,
            )
        )


async def verify_end_user_signup_intent(
    command: command.VerifyEndUserSignupIntent,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        otp_tokens = await uow.otp_token_repository.get_all_by(
            is_active=True,
            serial_number=command.resolve_token_serial_number,
            value=command.payload.one_time_password,
            state=command.payload.phone_number,
        )
        unexpired_otp_tokens = [
            ot for ot in otp_tokens if ot.expiration_time > datetime.utcnow()
        ]
        if len(unexpired_otp_tokens) == 0:
            raise InvalidOneTimePassword("Invalid password")

        otp_token = OTPToken(
            serial_number=command.request_token_serial_number,
            value=command.request_token_otp_value,
            state=command.payload.phone_number,
            expiration_time=datetime.utcnow() + command.request_token_token_age,
            is_active=True,
        )
        await uow.otp_token_repository.add(otp_token)
        await uow.commit()


async def signup_end_user(
    cmd: command.SignupEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        otp_tokens = await uow.otp_token_repository.get_all_by(
            is_active=True,
            serial_number=cmd.resolve_token_serial_number,
            value=cmd.resolve_token_otp_value,
            state=cmd.payload.phone_number,
        )
        unexpired_otp_tokens = [
            ot for ot in otp_tokens if ot.expiration_time > datetime.utcnow()
        ]
        if len(unexpired_otp_tokens) == 0:
            raise InvalidOneTimePassword("Invalid token")

        end_user = EndUser(
            reference=cmd.reference,
            airtable_reference=cmd.airtable_reference,
            **cmd.payload.dict(exclude={"token"})
        )
        end_user_access_token = EndUserAccessToken(
            end_user=end_user,
            value=cmd.request_access_token_value,
            expiration_time=datetime.utcnow() + cmd.request_access_token_token_age,
            is_active=True,
        )
        await uow.end_user_access_token_repository.add(end_user_access_token)
        await uow.end_user_repository.add(end_user)
        await uow.commit()


async def create_end_user_from_airtable_end_user(
    command: command.CreateEndUserFromAirtableEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_end_user = command.airtable_end_user

    # first_name & last_name
    raw_full_name = airtable_end_user["fields"].get("姓名 Full Name")
    first_name, last_name = split_name(raw_full_name)

    # gender
    raw_gender = airtable_end_user["fields"].get("性別 Gender")
    gender_value = None
    if raw_gender is not None:
        if raw_gender == "生理男 Male":
            gender_value = EndUser.GenderEnum.MALE.value
        elif raw_gender == "生理女 Female":
            gender_value = EndUser.GenderEnum.FEMALE.value
        elif raw_gender == "非二元性別 Non-binary":
            gender_value = EndUser.GenderEnum.NON_BINARY.value

    # birth_date
    raw_birth_date = airtable_end_user["fields"].get("出生年月日 Date of Birth")
    birth_date = cast_string_to_date(raw_birth_date)

    # tw_identity_card
    tw_identity_card_number = airtable_end_user["fields"].get("身分證字號 National ID No.")

    # email_address
    email_address = airtable_end_user["fields"].get("電子郵件 Email Address")

    # emergency_contact
    raw_emergency_contact_full_name = airtable_end_user["fields"].get(
        "緊急聯絡人姓名 Who would be your emergency contact?"
    )
    emergency_contact_first_name, emergency_contact_last_name = split_name(
        raw_emergency_contact_full_name
    )
    emergency_contact_relationship_type = airtable_end_user["fields"].get(
        "與緊急聯絡人的關係 What is their relationship to you? "
    )
    emergency_contact_phone_number = airtable_end_user["fields"].get(
        "緊急聯絡人電話 What is the phone number of your emergency contact?"
    )

    async with uow:
        end_user = EndUser(
            phone_number=command.phone_number,
            first_name=first_name,
            last_name=last_name,
            gender=gender_value,
            birth_date=birth_date,
            tw_identity_card_number=tw_identity_card_number,
            email_address=email_address,
            emergency_contact_first_name=emergency_contact_first_name,
            emergency_contact_last_name=emergency_contact_last_name,
            emergency_contact_relationship_type=emergency_contact_relationship_type,
            emergency_contact_phone_number=emergency_contact_phone_number,
            airtable_reference=airtable_end_user["id"],
        )
        await uow.end_user_repository.add(end_user)
        await uow.commit()


async def create_end_user_login_intent(
    command: command.CreateEndUserLoginIntent,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        otp_token = OTPToken(
            serial_number=command.request_token_serial_number,
            value=command.request_token_otp_value,
            state=command.payload.phone_number,
            expiration_time=datetime.utcnow() + command.request_token_token_age,
            is_active=True,
        )
        await uow.otp_token_repository.add(otp_token)
        await uow.commit()
        bus.push_event(
            event.EndUserLoginIntentCreated(
                phone_number=command.payload.phone_number,
                email_address=command.payload.email_address,
                otp_value=command.request_token_otp_value,
            )
        )


async def login_end_user(
    cmd: command.LoginEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        otp_tokens = await uow.otp_token_repository.get_all_by(
            is_active=True,
            serial_number=cmd.resolve_token_serial_number,
            value=cmd.resolve_token_otp_value,
            state=cmd.payload.phone_number,
        )
        unexpired_otp_tokens = [
            ot for ot in otp_tokens if ot.expiration_time > datetime.utcnow()
        ]
        if len(unexpired_otp_tokens) == 0:
            raise InvalidOneTimePassword("Invalid token")

        if cmd.payload.phone_number is not None:
            end_users = await uow.end_user_repository.get_all_by(
                or_(EndUser.is_guest == None, EndUser.is_guest == False),
                phone_number=cmd.payload.phone_number,
            )
        elif cmd.payload.email_address is not None:
            end_users = await uow.end_user_repository.get_all_by(
                or_(EndUser.is_guest == None, EndUser.is_guest == False),
                email_address=cmd.payload.email_address,
            )

        if len(end_users) != 1:
            raise MultipleEndUser("Multiple end users are found")
        end_user_access_token = EndUserAccessToken(
            end_user=end_users[0],
            value=cmd.request_access_token_value,
            expiration_time=datetime.utcnow() + cmd.request_access_token_token_age,
            is_active=True,
        )
        await uow.end_user_access_token_repository.add(end_user_access_token)
        await uow.commit()


async def logout_end_user(
    command: command.LogoutEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        end_user_access_tokens = await uow.end_user_access_token_repository.get_all_by(
            value=command.access_token_value
        )
        for euat in end_user_access_tokens:
            euat.is_active = False
        await uow.commit()


async def update_end_user(
    command: command.UpdateEndUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        end_user = await uow.end_user_repository.get_by_reference(
            command.end_user_reference
        )
        for k, v in command.payload.dict(exclude_none=True).items():
            setattr(end_user, k, v)
        await uow.commit()


# Deprecating
# async def update_end_user_by_service(
#     command: command.UpdateEndUserByService,
#     bus: MessageBus,
#     uow: SqlAlchemyUnitOfWork,
#     publisher: EventPublisher,
# ):
#     async with uow:
#         end_user = await uow.end_user_repository.get_by_reference(
#             command.end_user_reference
#         )
#         for k, v in command.payload.dict(exclude_none=True).items():
#             setattr(end_user, k, v)
#         await uow.commit()


async def create_team_internal_user(
    command: command.CreateTeamInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        internal_user = await uow.internal_user_repository.get_by_reference(
            command.payload.internal_user_reference
        )
        team_internal_user = TeamInternalUser(
            team_reference=command.team_reference, internal_user=internal_user
        )
        await uow.team_internal_user_repository.add(team_internal_user)
        await uow.commit()


async def delete_team_internal_user(
    command: command.DeleteTeamInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        await uow.team_internal_user_repository.delete_by_reference(
            command.team_internal_user_reference
        )
        await uow.commit()


async def create_end_user_by_internal_user(
    cmd: command.CreateEndUserByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        await uow.end_user_repository.add(
            EndUser(
                reference=cmd.reference,
                first_name=cmd.payload.first_name,
                last_name=cmd.payload.last_name,
                phone_number=cmd.payload.phone_number,
                email_address=cmd.payload.email_address,
                # is_guest=True,
                # care_airtable_reference=command.care_airtable_reference,
            )
        )
        await uow.commit()


# Deprecating
# async def create_end_user_by_service(
#     command: command.CreateEndUserByService,
#     bus: MessageBus,
#     uow: SqlAlchemyUnitOfWork,
#     publisher: EventPublisher,
# ):
#     async with uow:
#         await uow.end_user_repository.add(
#             EndUser(
#                 reference=command.payload.reference,
#                 first_name=command.payload.first_name,
#                 last_name=command.payload.last_name,
#                 phone_number=command.payload.phone_number,
#                 is_created_by_service=True,
#                 care_airtable_reference=command.care_airtable_reference,
#             )
#         )
#         await uow.commit()


async def update_team_team_permissions(
    command: command.UpdateTeamTeamPermissions,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        permissions = await uow.permission_repository.get_all_by()
        permission_map = {p.reference: p for p in permissions}
        team = await uow.team_repository.get_by_reference(command.team_reference)
        team.team_permissions = [
            TeamPermission(
                team_reference=team.reference,
                permission=permission_map[team_permission.permission_reference],
            )
            for team_permission in command.payload.__root__
        ]
        await uow.commit()


async def create_team_by_internal_user(
    command: command.CreateTeamByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        organization = await uow.organization_repository.get_by_reference(
            command.organization_reference
        )
        team = Team(
            display_name=command.payload.display_name,
            display_responsibility=command.payload.display_responsibility,
            organization=organization,
            team_permissions=[],
            team_internal_users=[],
        )
        await uow.team_repository.add(team)
        await uow.commit()


async def update_team_by_internal_user(
    command: command.UpdateTeamByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        team = await uow.team_repository.get_by_reference(command.team_reference)
        team.display_name = command.payload.display_name
        team.display_responsibility = command.payload.display_responsibility
        await uow.commit()


async def delete_team_by_internal_user(
    command: command.DeleteTeamByInternalUser,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        await uow.team_repository.delete_by_reference(command.team_reference)
        await uow.commit()


async def pull_airtable_end_user(
    event: event.AirtableEndUserUpserted,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_end_user = await airtable_api_client.get_record_by_id(
        BaseEnum.ESEN_CLINIC, TableEnum.EHR_MASTERSHEET, event.airtable_reference
    )

    # phone_number
    phone_number = airtable_end_user["fields"].get("手機號碼 Phone No. - reformatted")
    if phone_number is None:
        raise UnprocessableAirtableEndUser("phone number required")
    if not phone_number.startswith("+"):
        raise UnprocessableAirtableEndUser("Invalid format of phone number")

    # first_name & last_name
    raw_full_name = airtable_end_user["fields"].get("姓名 Full Name")
    first_name, last_name = split_name(raw_full_name)
    raw_gender = airtable_end_user["fields"].get("性別 Gender")

    # gender
    gender_value = None
    if raw_gender is not None:
        if raw_gender == "生理男 Male":
            gender_value = EndUser.GenderEnum.MALE.value
        elif raw_gender == "生理女 Female":
            gender_value = EndUser.GenderEnum.FEMALE.value
        elif raw_gender == "非二元性別 Non-binary":
            gender_value = EndUser.GenderEnum.NON_BINARY.value

    # birth_date
    raw_birth_date = airtable_end_user["fields"].get("出生年月日 Date of Birth")
    birth_date = None
    if raw_birth_date is not None:
        birth_date = cast_string_to_date(raw_birth_date)

    # tw_identity_card
    tw_identity_card_number = airtable_end_user["fields"].get("身分證字號 National ID No.")
    if (
        tw_identity_card_number
        == "Old and new ID: BD0087973/A900221275/ passport: HB565498"
    ):
        tw_identity_card_number = "HB565498"

    # email_address
    email_address = airtable_end_user["fields"].get("電子郵件 Email Address")

    # emergency_contact
    raw_emergency_contact_full_name = airtable_end_user["fields"].get(
        "緊急聯絡人姓名 Who would be your emergency contact?"
    )
    emergency_contact_first_name, emergency_contact_last_name = split_name(
        raw_emergency_contact_full_name
    )
    emergency_contact_relationship_type = airtable_end_user["fields"].get(
        "與緊急聯絡人的關係 What is their relationship to you? "
    )
    emergency_contact_phone_number = airtable_end_user["fields"].get(
        "緊急聯絡人電話 What is the phone number of your emergency contact?"
    )

    async with uow:
        end_user = await uow.end_user_repository.get_by(
            airtable_reference=event.airtable_reference
        )
        if end_user is None:
            # create local end_user
            end_user = EndUser(
                phone_number=phone_number,
                first_name=first_name,
                last_name=last_name,
                airtable_reference=airtable_end_user["id"],
            )
            await uow.end_user_repository.add(end_user)

        # update local appointment
        end_user.gender = gender_value
        end_user.birth_date = birth_date
        end_user.tw_identity_card_number = tw_identity_card_number
        end_user.email_address = email_address
        end_user.emergency_contact_first_name = emergency_contact_first_name
        end_user.emergency_contact_last_name = emergency_contact_last_name
        end_user.emergency_contact_relationship_type = (
            emergency_contact_relationship_type
        )
        end_user.emergency_contact_phone_number = emergency_contact_phone_number

        await uow.commit()


async def publish_end_user_signup_intent_created(
    event: event.EndUserSignupIntentCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(event)


async def publish_end_user_login_intent_created(
    event: event.EndUserLoginIntentCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(event)


async def create_delivery_order_recipient_end_user_if_not_present(
    e: event.DeliveryOrderPrepared,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    first_name, last_name = split_name(e.raw_recipient_end_user_full_name)
    normalized_phone_number = get_normalized_phone_number(
        e.raw_recipient_end_user_phone_number
    )
    async with uow:
        end_user = await uow.end_user_repository.get_by(
            first_name=first_name,
            last_name=last_name,
            phone_number=normalized_phone_number,
            is_guest=True,
        )
        if end_user is None:
            end_user = EndUser(
                reference=uuid.uuid4(),
                first_name=first_name,
                last_name=last_name,
                phone_number=normalized_phone_number,
                is_guest=True,
            )
            queued_event = event.LocalDeliveryOrderRecipientEndUserCreated(
                delivery_order_reference=e.delivery_order_reference,
                end_user_reference=end_user.reference,
            )
            await uow.end_user_repository.add(end_user)
            await uow.commit()
            bus.push_event(queued_event)
        else:
            bus.push_event(
                event.LocalDeliveryOrderRecipientEndUserCreated(
                    delivery_order_reference=e.delivery_order_reference,
                    end_user_reference=end_user.reference,
                )
            )


async def create_delivery_order_served_end_user_if_not_present(
    e: event.DeliveryOrderPrepared,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    first_name, last_name = split_name(e.raw_served_end_user_full_name)
    normalized_phone_number = get_normalized_phone_number(
        e.raw_served_end_user_phone_number
    )
    async with uow:
        end_user = await uow.end_user_repository.get_by(
            first_name=first_name,
            last_name=last_name,
            phone_number=normalized_phone_number,
            is_guest=True,
        )
        if end_user is None:
            end_user = EndUser(
                reference=uuid.uuid4(),
                first_name=first_name,
                last_name=last_name,
                phone_number=normalized_phone_number,
                is_guest=True,
            )
            queued_event = event.LocalDeliveryOrderServedEndUserCreated(
                delivery_order_reference=e.delivery_order_reference,
                end_user_reference=end_user.reference,
            )
            await uow.end_user_repository.add(end_user)
            await uow.commit()
            bus.push_event(queued_event)
        else:
            bus.push_event(
                event.LocalDeliveryOrderServedEndUserCreated(
                    delivery_order_reference=e.delivery_order_reference,
                    end_user_reference=end_user.reference,
                )
            )


async def publish_delivery_order_recipient_end_user_created(
    e: event.LocalDeliveryOrderRecipientEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(
        event.DeliveryOrderRecipientEndUserCreated(
            delivery_order_reference=e.delivery_order_reference,
            end_user_reference=e.end_user_reference,
        )
    )


async def create_care_airtable_end_user_for_delivery_order_recipient_end_user(
    e: event.LocalDeliveryOrderRecipientEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        end_user = await uow.end_user_repository.get_by_reference(e.end_user_reference)
        if end_user.care_airtable_reference is None:
            airtable_config = get_airtable_config()
            airtable_api_client = AirtableAPIClient(
                airtable_config.AIRTABLE_API_KEY_EDITOR
            )
            care_airtable_end_user_dict = await airtable_api_client.create_record(
                BaseEnum.ESEN_CARE,
                TableEnum.客戶,
                {
                    "姓名": get_full_person_name(
                        PersonSchema(
                            first_name=end_user.first_name, last_name=end_user.last_name
                        )
                    ),
                    "手機號碼": end_user.phone_number,
                },
            )
            end_user.care_airtable_reference = care_airtable_end_user_dict["id"]
            queued_event = event.CareAirtableDeliveryOrderRecipientEndUserCreated(
                delivery_order_reference=e.delivery_order_reference,
                end_user_reference=end_user.reference,
                care_airtable_end_user_reference=end_user.care_airtable_reference,
            )
            await uow.commit()
            bus.push_event(queued_event)
        else:
            bus.push_event(
                event.CareAirtableDeliveryOrderRecipientEndUserCreated(
                    delivery_order_reference=e.delivery_order_reference,
                    end_user_reference=end_user.reference,
                    care_airtable_end_user_reference=end_user.care_airtable_reference,
                )
            )


async def publish_delivery_order_served_end_user_created(
    e: event.LocalDeliveryOrderServedEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(
        event.DeliveryOrderServedEndUserCreated(
            delivery_order_reference=e.delivery_order_reference,
            end_user_reference=e.end_user_reference,
        )
    )


async def create_care_airtable_end_user_for_delivery_order_served_end_user(
    e: event.LocalDeliveryOrderServedEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    async with uow:
        end_user = await uow.end_user_repository.get_by_reference(e.end_user_reference)
        if end_user.care_airtable_reference is None:
            airtable_config = get_airtable_config()
            airtable_api_client = AirtableAPIClient(
                airtable_config.AIRTABLE_API_KEY_EDITOR
            )
            care_airtable_end_user_dict = await airtable_api_client.create_record(
                BaseEnum.ESEN_CARE,
                TableEnum.客戶,
                {
                    "姓名": get_full_person_name(
                        PersonSchema(
                            first_name=end_user.first_name, last_name=end_user.last_name
                        )
                    ),
                    "手機號碼": end_user.phone_number,
                },
            )
            end_user.care_airtable_reference = care_airtable_end_user_dict["id"]
            queued_event = event.CareAirtableDeliveryOrderServedEndUserCreated(
                delivery_order_reference=e.delivery_order_reference,
                end_user_reference=end_user.reference,
                care_airtable_end_user_reference=end_user.care_airtable_reference,
            )
            await uow.commit()
            bus.push_event(queued_event)
        else:
            bus.push_event(
                event.CareAirtableDeliveryOrderServedEndUserCreated(
                    delivery_order_reference=e.delivery_order_reference,
                    end_user_reference=end_user.reference,
                    care_airtable_end_user_reference=end_user.care_airtable_reference,
                )
            )


async def publish_care_airtable_delivery_order_recipient_end_user_created(
    e: event.CareAirtableDeliveryOrderRecipientEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(e)


async def publish_care_airtable_delivery_order_served_end_user_created(
    e: event.CareAirtableDeliveryOrderServedEndUserCreated,
    bus: MessageBus,
    uow: SqlAlchemyUnitOfWork,
    publisher: EventPublisher,
):
    publisher.publish(e)


command_handler_map = {
    command.UpdateOrganizationByOwner: update_organization_by_owner,
    command.LoginInternalUser: login_internal_user,
    command.LogoutInternalUser: logout_internal_user,
    command.CreateEndUserSignupIntent: create_end_user_signup_intent,
    command.VerifyEndUserSignupIntent: verify_end_user_signup_intent,
    command.SignupEndUser: signup_end_user,
    command.CreateEndUserFromAirtableEndUser: create_end_user_from_airtable_end_user,
    command.CreateEndUserLoginIntent: create_end_user_login_intent,
    command.LoginEndUser: login_end_user,
    command.LogoutEndUser: logout_end_user,
    command.UpdateEndUser: update_end_user,
    # command.UpdateEndUserByService: update_end_user_by_service,
    command.CreateTeamInternalUser: create_team_internal_user,
    command.DeleteTeamInternalUser: delete_team_internal_user,
    command.CreateEndUserByInternalUser: create_end_user_by_internal_user,
    # command.CreateEndUserByService: create_end_user_by_service,
    command.UpdateTeamTeamPermissions: update_team_team_permissions,
    command.CreateTeamByInternalUser: create_team_by_internal_user,
    command.UpdateTeamByInternalUser: update_team_by_internal_user,
    command.DeleteTeamByInternalUser: delete_team_by_internal_user,
}

event_handlers_map = {
    event.EndUserSignupIntentCreated: [publish_end_user_signup_intent_created],
    event.EndUserLoginIntentCreated: [publish_end_user_login_intent_created],
    event.AirtableEndUserUpserted: [pull_airtable_end_user],
    event.DeliveryOrderPrepared: [
        create_delivery_order_served_end_user_if_not_present,
        create_delivery_order_recipient_end_user_if_not_present,
    ],
    event.LocalDeliveryOrderRecipientEndUserCreated: [
        publish_delivery_order_recipient_end_user_created,
        create_care_airtable_end_user_for_delivery_order_recipient_end_user,
    ],
    event.LocalDeliveryOrderServedEndUserCreated: [
        publish_delivery_order_served_end_user_created,
        create_care_airtable_end_user_for_delivery_order_served_end_user,
    ],
    event.CareAirtableDeliveryOrderRecipientEndUserCreated: [
        publish_care_airtable_delivery_order_recipient_end_user_created,
    ],
    event.CareAirtableDeliveryOrderServedEndUserCreated: [
        publish_care_airtable_delivery_order_served_end_user_created,
    ],
}
