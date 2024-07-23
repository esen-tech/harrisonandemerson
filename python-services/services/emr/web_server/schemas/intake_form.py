from pydantic import BaseModel


class RetrieveEndUserIntakeFormSchema(BaseModel):
    is_finished: bool
    url: str | None
