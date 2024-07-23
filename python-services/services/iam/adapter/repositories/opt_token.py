from modules.adapter.repository import SqlAlchemyRepository
from modules.domain.models.entity import Entity
from services.iam.domain.models.otp_token import OTPToken


class OTPTokenRepository(SqlAlchemyRepository[OTPToken]):
    @property
    def _model(self) -> Entity:
        return OTPToken
