from typing import Any, Dict, Iterable, List

import httpx

from modules.airtable.enum import BaseEnum, TableEnum
from modules.airtable.exceptions import AirtableAPIClientError


class AirtableAPIClient:
    def __init__(self, api_token: str):
        self._host = "https://api.airtable.com/v0"
        self._api_token = api_token

    def handle_error(self, res_json: dict, extra_log_dict: dict = None):
        if res_json.get("error"):
            print(res_json.get("error"))
            if extra_log_dict is not None:
                for k, v in extra_log_dict.items():
                    print(f"{k}:", v)
            raise AirtableAPIClientError(
                "Unable to proceed current airtable api request"
            )

    async def create_record(
        self,
        base: BaseEnum,
        table: TableEnum,
        fields: Dict[str, Any],
        typecast: bool = False,
    ) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self._host}/{base.value}/{table.value}",
                headers={"Authorization": f"Bearer {self._api_token}"},
                json={"records": [{"fields": fields}], "typecast": typecast},
            )
            res_json = response.json()
            self.handle_error(res_json, extra_log_dict={"fields": fields})
            [record] = res_json["records"]
            return record

    async def get_paged_records(
        self,
        base: BaseEnum,
        table: TableEnum,
        offset: str = None,
        fields: List[str] = None,
        filter_by_formula: str = None,
    ) -> dict:
        params = {}
        if offset is not None:
            params["offset"] = offset
        if fields is not None:
            params["fields"] = fields
        if filter_by_formula is not None:
            params["filterByFormula"] = filter_by_formula
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._host}/{base.value}/{table.value}",
                headers={"Authorization": f"Bearer {self._api_token}"},
                params=params,
            )
            res_json = response.json()
            self.handle_error(res_json, extra_log_dict={"fields": fields})
            return res_json

    async def get_all_records(self, *args, **kwargs) -> List[dict]:
        has_offset = True
        offset = None
        records = []
        while has_offset:
            res = await self.get_paged_records(*args, **kwargs, offset=offset)
            offset = res.get("offset", None)
            records.extend(res["records"])
            if offset is None:
                has_offset = False
        return records

    async def get_all_iterable_records(self, *args, **kwargs) -> Iterable[dict]:
        has_offset = True
        offset = None
        while has_offset:
            res = await self.get_paged_records(*args, **kwargs, offset=offset)
            offset = res.get("offset", None)
            for record in res["records"]:
                yield record
            if offset is None:
                has_offset = False

    async def get_record_by_id(
        self,
        base: BaseEnum,
        table: TableEnum,
        record_id: str,
    ) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self._host}/{base.value}/{table.value}/{record_id}",
                headers={"Authorization": f"Bearer {self._api_token}"},
            )
            res_json = response.json()
            self.handle_error(res_json)
            return res_json

    async def update_record_by_id(
        self,
        base: BaseEnum,
        table: TableEnum,
        record_id: str,
        fields: dict,
        typecast: bool = False,
    ):
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self._host}/{base.value}/{table.value}",
                headers={"Authorization": f"Bearer {self._api_token}"},
                json={
                    "records": [{"id": record_id, "fields": fields}],
                    "typecast": typecast,
                },
            )
            res_json = response.json()
            self.handle_error(res_json, extra_log_dict={"fields": fields})
            return res_json
