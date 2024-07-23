from pydantic import BaseModel


class OrganizationSchema(BaseModel):
    display_key: str
    branch_key: str | None


def get_organization_name(organization: OrganizationSchema | None = None) -> str:
    if organization is None:
        return ""
    if organization.branch_key is not None:
        return f"{organization.display_key}（{organization.branch_key}）"
    else:
        return organization.display_key
