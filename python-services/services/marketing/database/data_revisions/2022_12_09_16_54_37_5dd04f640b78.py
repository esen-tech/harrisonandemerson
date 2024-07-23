import random
import string

from modules.database.migration import DataMigration

revision = "5dd04f640b78"
down_revision = None

# https://airtable.com/apphVNA9a1DsYv25n/tblOyuu8BnSBrxocU/viwPE1nlfTDwCw3vH?blocks=hide
# recW8UmwTwdX8JS7i
# rec4DIkPKwloA0bGM
# rec1lVZu0HHrZLTjn
# rec7BjUGLnKi675q1
# recZBYxcxeEKJWAvq
# recJn3j93F2DCOCvH
# recK0QqwgkvHr5glX
# recPRdtTbZQwKh9wT
# reciGhiYhRkbf70mN
# recGSK2Olz0nSo4lB
# recKvvvMCG6ab3WoY
# rec32CfgNlk0ZqLT7
# recsxX8tWxFPNCIid
# recZQoCfDisM12P6P
# rec16hI7hfK2iguYJ
# rec0cxGDAjwqM2khQ
# recHWxcNFfVZTanxy
# rectElY7Utscfh7sg
# recwbcGMRzDhlioI9
# recLZxFZbAQkIpKml
# recOFkLWGo0Kb4kc2
# rec4HqPMXxIPWToOK
# reconeUccP3KNhp6L
# recyD3GT2GTfcQcXt
# rec5TafuYcbLhnks6
# recUxr1nCJz4T2k9X
# recf4qoFt9ZWkSyCy
# recEUwtYDrkdLtwns
# rec8ms1OlheO4bL2B
# recI2LEw804wto2OF
# recsyappdk8oyimXg
# recjHG0ilpXF9pVjm
# recXF9FvVi5xZ0r9e
# reckSpYlO6EvgJ9pZ
# recpdppDOFstxCRq1
# recNOXRA8CsSDEoQF
# rec1SAB97AcLN3l4P
# recZfsCJcQrB3F4wh
# rec0DpNMS5Yg0ugue
# recP1x2yMTYlvM5aw
# recM7BXd205gbU2I2
# recx06A6kOosazy7d
# recdbwhZzQIDlnBXX
# recPQnITlMLP6hVau
# recuKhj8E18qy81gR
# rec3PeyjzpRaHrngf
# recOAAV22dadSzGsP
# rece9VkgsZmCP31HZ
# recIYAgxOhdUqSM8U
# rec4ReEkQjjy4SVSU
# recbR3bqWQlRxPWEG
# recC6aoFUNQzPT9mO
# recy7aCOkMqmpqXHp
# reczPUiKbsUKNC2ZM
# recf07q9PMGvFJlva
# recvG56cQtd7OsyOh
# recPKfshesZ93eOxS
# recWyILW3mUCoASk1
# rechMPmQygKX1Ok7W
# recH4lpmmPat1mnZM
# recre8bglA5DiyGNq
# recuEUgwR9TAeJJaV
# recIYdCtK5BNot3eY
# recCK2qvkmKc23Z9X
# rec7Z3ceKdigE9zge
# rec2R7bx9YpXvOj2H
# recWDrVeUPdRh5O54
# recSJoJIvmbYhuznP
# reckfeuMpjkNtV6Eh
# recjxtfa1ZY0UZszd
# recbJt96OIwlAGU2E
# recpEa6OV2MhlneXR
# recjFDy8RDnP0mLps
# rec2iYKmudlBpWblr
# recPOpIrvT1QZ3DlS
# recJUFCEuq7AtFqOn
# recrzVx5ULblXtbYA
# recYTjxFlvQv5D8dI
# rec0SP1gcAa1zFbRr
# reckKc9O7yMgmJ6wP
# recZzK0BFXaGHfsO4
# recSPciuce4j8cpqf
# recM8uALrEz4brIPG
# recO1IsJJJEcPz3R6
# recu5m4AACSYdOoM9
# recKH9NisUp0ZfIj9


async def upgrade(op: DataMigration.Operation):
    from services.marketing.adapter.repositories.end_user_care_product_referral_code import (
        EndUserCareProductReferralCodeRepository,
    )
    from services.marketing.domain.models.end_user_care_product_referral_code import (
        EndUserCareProductReferralCode,
    )

    end_user_references = [
        "1aa6d41a-24fb-45ed-b4a6-4784fc05d649",
        "60eba00a-896c-4569-a893-1c84fe814867",
        "e5eff9d5-3ec4-4811-8f18-fa331596e17a",
        "9e361f91-27cb-4d1d-8809-06c4adde9d79",
        "577f1420-3ce4-454a-b883-f36b0bd77f66",
        "987b4fc1-16d8-4bec-9449-c7f1229d5266",
        "ca819aea-cb1b-42d7-a7ff-545ab469c144",
        "4d813524-f885-4b86-9cf1-dcaf7f4a1d91",
        "00b1466a-bc7d-4639-b3ec-673e4922e205",
        "ee008ab2-3990-4b34-903b-b15e21f3f9de",
        "940b9339-d066-4b00-8ef9-b4feed53c573",
        "076b34cc-983f-4569-9fed-4d8dda762714",
        "fe500257-fc87-494f-a892-68f21b078d79",
        "3a770203-f2c7-4cce-b31c-0fbf3ea40ba5",
        "57093ad8-849d-4895-ab62-2b2f7a66a726",
        "83014e62-b50b-4953-a871-0fb8ec2166dd",
        "b8949668-1c18-4679-bae5-b5bc41850540",
        "168d00c3-3bbc-48da-9eb5-4caeef7eba8d",
        "c597e7c7-f7f2-4581-b85b-2d23e3d26450",
        "19fa80ee-07e9-4bb2-a670-93763f1e430e",
        "ab532566-b5d8-4843-8d72-f8168b417620",
        "dbd1bf5f-2268-47bc-9abe-413116e5f2ee",
        "7f716a87-5410-4c9a-b830-c7c8e5188a38",
        "eec94557-a3e3-4244-b5d0-79c03e202199",
        "f311f407-3e59-4eb8-be46-207328bffc8a",
        "61c273cd-f573-4895-8768-6062bb0af0b7",
        "0afeb679-5309-42e6-bd62-17147d8343ad",
        "de1e5540-1a8e-4c3b-8728-222fc231bbd6",
        "2cc59e49-6ef9-41b3-aa0f-f40266db1045",
        "7d2aea40-9e00-4cfc-b74e-76eecb7731ad",
        "a81fc0cf-225a-4020-9564-5bb450825715",
        "3f005c2b-ed37-415d-9f86-399ae8aa9202",
        "1169b6d1-ad55-44e1-914d-25dda740aadb",
        "0c4c699f-2773-44c7-842e-c33167ee2d75",
        "43228658-4896-46c0-a342-78c5daefb924",
        "0796c539-2e2f-48cd-83e6-b34ae33b8be9",
        "d6a0a1f7-3321-4e50-8804-55b668a4b569",
        "07e5773e-d17b-4165-98f1-a6f740bb8230",
        "4b5f716f-2937-4d48-adba-360302995837",
        "d68201bf-8698-491f-b2a0-e3d5e879cc55",
        "9555d31e-07a6-43a8-8e4f-deb658d6ab21",
        "c4fa24ce-74b8-4613-b0d9-de1717b6ccb5",
        "c57f696b-56c3-4e4e-a516-59f4f2168028",
        "4bcb23f8-371e-4c89-b0e4-fba50e27d455",
        "23d6d437-113a-4e13-bdba-d97f8e8224ba",
        "d2b2da8a-3358-472d-bf69-0f5fb29a86a2",
        "d9169047-2355-46c6-9fcf-0acdcb07471a",
        "4a5f350b-8921-47f4-982c-56f41805a9ea",
        "83dbe3bc-c8f8-4998-a723-025c18471f8c",
        "e98aae4d-d5d0-4260-b5be-b7e0281c4508",
        "8ab03c10-1065-4b54-b569-c7b2d219eb0c",
        "b0139eaf-0f13-4867-946f-4f18b4b54ed6",
        "3b3d0308-4ac4-42a3-af2c-7ac896f0b996",
        "36226f76-f5f7-4047-868e-61dd6604a264",
        "0766b282-de06-4157-b85e-343158b1b38a",
        "7ce571a0-93bc-422f-ab8f-a375639bb307",
        "0c901615-3d12-4190-89e4-74d08940b3eb",
        "da7e0558-4eeb-4352-ba3e-46fbe5a33ec9",
        "e5284540-c4bf-4369-aaab-151ce1425e5c",
        "86d51309-53d7-4bef-8b77-4b6de813ffc6",
        "6a6e3890-4a45-4c11-93a7-ab67b19cb7b4",
        "5d9f9c54-ce4b-4117-85de-900d33470a30",
        "687ddf8c-d600-4d53-a56c-0412b6c3a370",
        "e6d08fa5-495e-47be-80df-b0c9134985c3",
        "5138671a-88d3-434b-a1e3-b05172374f07",
        "6a7eaef5-4fb1-443d-b91c-2ebb5862b25e",
        "5482430e-4300-4097-9b41-9799e210c096",
        "bed7c5d8-7cce-485d-b006-6f827b18fc1a",
        "b47b23d9-f291-41bc-9d91-5f2d1e33160a",
        "298771d9-b852-49bf-9208-ac373e2e815a",
        "c098fe5c-eede-405e-ab6e-4b42ff2d62b0",
        "08997cb8-4dc9-433f-b1f2-57c62afd7d7a",
        "15625a3f-403a-4b14-b8df-37ee7487fd1b",
        "9c1b7f8d-d18d-44e7-864b-a170c9fd5711",
        "afd71285-1722-4c1c-9b6f-3226557b9865",
        "e967ef77-c697-40dc-b278-8aa74a14e81d",
        "9f7df2b0-7ce6-4e9f-abe7-8f6868845e06",
        "4d73ae39-c10e-4b98-a6a4-716ccaf6d938",
        "f4763bd3-327a-4d50-8160-10223b8a54fc",
        "4326ff7d-19b6-4f68-af0f-85d0f4925e07",
        "a869e6b5-60a6-459f-84c0-59b404647793",
        "ce2a69d6-1d2d-440c-a000-3cd2c5f2bfb6",
        "15594141-b5e7-41cb-b928-f3f95b5b37a9",
        "606e7857-3a47-4652-a271-1fb2633749fc",
        "4c7a5c80-dda0-4998-a625-d603c77f33c8",
        "951864bf-975f-4d60-ac24-efe414e6c46a",
    ]

    async with op.acquire_db_session() as session:
        end_user_care_product_referral_code_repository = (
            EndUserCareProductReferralCodeRepository(session)
        )

    random.seed(666)
    for end_user_reference in end_user_references:
        code = "".join(
            ["@", random.choice(string.digits)]
            + [random.choice(string.digits + string.ascii_lowercase) for _ in range(3)]
        )
        await end_user_care_product_referral_code_repository.add(
            EndUserCareProductReferralCode(
                end_user_reference=end_user_reference,
                code=code,
                referee_financial_order_discount_price_amount="1000",
            )
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
