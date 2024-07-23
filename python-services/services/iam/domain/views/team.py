from typing import AsyncIterator, List, Tuple

from modules.domain.types import Reference
from modules.domain.views.page_view_enhancer import PageMetadataSchema
from modules.domain.views.view_enhancer import ViewEnhancement
from services.iam.domain.models.team import Team
from services.iam.service_layer.unit_of_work import SqlAlchemyUnitOfWork


async def get_teams_and_page_metadata_by_filter_and_page_and_organization_reference(
    uow: SqlAlchemyUnitOfWork,
    filter_view_enhancement: ViewEnhancement,
    page_view_enhancement: ViewEnhancement,
    organization_reference: Reference,
) -> AsyncIterator[Tuple[List[Team], PageMetadataSchema]]:
    async with uow:
        teams = await uow.team_repository.get_all_by(
            organization_reference=organization_reference,
            view_enhancements=[filter_view_enhancement, page_view_enhancement],
        )
        count = await uow.team_repository.get_count_by(
            organization_reference=organization_reference,
            view_enhancements=[filter_view_enhancement],
        )
        yield teams, page_view_enhancement.enhancer.get_metadata(
            context=page_view_enhancement.context,
            enhanced_entities=teams,
            count_all_page=count,
        )


async def get_by_team_reference(
    uow: SqlAlchemyUnitOfWork,
    team_reference: Reference,
) -> AsyncIterator[Team]:
    async with uow:
        team = await uow.team_repository.get_by_reference(team_reference)
        yield team
