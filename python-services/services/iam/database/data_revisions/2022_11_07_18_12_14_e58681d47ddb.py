from datetime import date

from modules.database.migration import DataMigration
from sqlalchemy.future import select

revision = "e58681d47ddb"
down_revision = "5865907b12a9"


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.internal_user import InternalUser
    from services.iam.domain.models.organization import Organization

    async with op.acquire_db_session() as session:
        statement = select(InternalUser).where(
            InternalUser.data_alias == "internal_user_wilson_tsou"
        )
        result = await session.execute(statement)
        internal_user: InternalUser = result.scalars().first()
        internal_user_reference = internal_user.reference

    async with op.acquire_db_session() as session:
        statement = select(Organization).where(
            Organization.data_alias == "organization_伊生診所"
        )
        result = await session.execute(statement)
        organization: Organization = result.scalars().first()
        organization.operational_state = Organization.OperationalStateEnum.OPEN.value
        organization.registered_name = "伊生診所"
        organization.registered_address = "台北市大安區忠孝東路四段216巷32弄15號(1樓)"
        organization.registered_medical_specialty = "西醫一般科"
        organization.registered_organization_code = "350102G234"
        organization.registered_representative_internal_user_reference = (
            internal_user_reference
        )
        organization.registered_business_commencement_date = date(2021, 10, 15)

    async with op.acquire_db_session() as session:
        statement = select(Organization).where(
            Organization.data_alias == "organization_伊生股份有限公司"
        )
        result = await session.execute(statement)
        organization: Organization = result.scalars().first()
        organization.operational_state = Organization.OperationalStateEnum.OPEN.value
        organization.registered_name = "伊生股份有限公司"


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
