from modules.database.migration import DataMigration
from sqlalchemy.future import select

revision = "5865907b12a9"
down_revision = "803ace3591d0"


async def upgrade(op: DataMigration.Operation):
    from modules.airtable.airtable_api_client import AirtableAPIClient
    from modules.airtable.config import get_config as get_airtable_config
    from modules.airtable.enum import BaseEnum, TableEnum
    from modules.domain.types import cast_string_to_date
    from services.iam.domain.models.end_user import EndUser
    from services.iam.utils import split_name

    airtable_config = get_airtable_config()
    airtable_api_client = AirtableAPIClient(airtable_config.AIRTABLE_API_KEY)
    airtable_end_users_iterator = airtable_api_client.get_all_iterable_records(
        BaseEnum.ESEN_CLINIC,
        TableEnum.EHR_MASTERSHEET,
        fields=[
            "姓名 Full Name",
            "手機號碼 Phone No. - reformatted",
            "身分證字號 National ID No.",
            "性別 Gender",
            "電子郵件 Email Address",
            "出生年月日 Date of Birth",
            "緊急聯絡人姓名 Who would be your emergency contact?",
            "與緊急聯絡人的關係 What is their relationship to you? ",
            "緊急聯絡人電話 What is the phone number of your emergency contact?",
        ],
    )

    async with op.acquire_db_session() as session:
        statement = select(EndUser)
        result = await session.execute(statement)
        end_users = result.scalars().all()
        end_user_phone_number_map = {eu.phone_number: eu for eu in end_users}
        i = 0
        async for airtable_end_user in airtable_end_users_iterator:
            i += 1

            # phone_number
            phone_number = airtable_end_user["fields"].get(
                "手機號碼 Phone No. - reformatted"
            )
            if phone_number is None:
                continue
            if not phone_number.startswith("+"):
                continue
            if phone_number in end_user_phone_number_map:
                continue

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
            tw_identity_card_number = airtable_end_user["fields"].get(
                "身分證字號 National ID No."
            )
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

            end_user = EndUser(
                phone_number=phone_number,
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
            session.add(end_user)
            if i % 1 == 0:
                print(f"i = {i}")
                await session.commit()


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
