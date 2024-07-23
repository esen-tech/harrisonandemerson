from datetime import datetime

from modules.database.migration import DataMigration

revision = "2c2987314408"
down_revision = "9979b303767c"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.service import Service
    from services.iam.domain.models.service_access_token import ServiceAccessToken

    async with op.acquire_db_session() as session:
        iam_service = Service(
            data_alias="service_iam",
            reference="6e016695-6c76-43cb-89fd-ba1a301a7392",
            name="iam",
        )
        iam_service_access_token = ServiceAccessToken(
            value="63kb7P6HXE^zD3V7",
            expiration_time=datetime.max,
            is_active=True,
            service=iam_service,
        )
        session.add(iam_service)
        session.add(iam_service_access_token)

        notification_service = Service(
            data_alias="service_notification",
            reference="7a1c2547-4884-4534-8c3a-9b378e57bf02",
            name="notification",
        )
        notification_service_access_token = ServiceAccessToken(
            value="4kwUTb@szEIwbh9y",
            expiration_time=datetime.max,
            is_active=True,
            service=notification_service,
        )
        session.add(notification_service)
        session.add(notification_service_access_token)

        scheduling_service = Service(
            data_alias="service_scheduling",
            reference="58e563b8-9ec0-416c-992c-def15d278446",
            name="scheduling",
        )
        scheduling_service_access_token = ServiceAccessToken(
            value="t&tQ!L*JMRgXAV4)",
            expiration_time=datetime.max,
            is_active=True,
            service=scheduling_service,
        )
        session.add(scheduling_service)
        session.add(scheduling_service_access_token)

        emr_service = Service(
            data_alias="service_emr",
            reference="59832122-ef95-4e9c-a852-50f5040a0cb7",
            name="emr",
        )
        emr_service_access_token = ServiceAccessToken(
            value="rx6fRTpwyEqB5@Pp",
            expiration_time=datetime.max,
            is_active=True,
            service=emr_service,
        )
        session.add(emr_service)
        session.add(emr_service_access_token)

        campaign_service = Service(
            data_alias="service_campaign",
            reference="fc226e82-4713-4c4f-bbbe-8d3bc2f236c1",
            name="campaign",
        )
        campaign_service_access_token = ServiceAccessToken(
            value="sG$q9VKCQnB@7#+w",
            expiration_time=datetime.max,
            is_active=True,
            service=campaign_service,
        )
        session.add(campaign_service)
        session.add(campaign_service_access_token)


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
