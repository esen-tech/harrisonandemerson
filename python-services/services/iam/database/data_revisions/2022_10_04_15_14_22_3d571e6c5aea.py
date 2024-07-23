from modules.database.migration import DataMigration

revision = "3d571e6c5aea"
down_revision = None


async def upgrade(op: DataMigration.Operation):
    from services.iam.domain.models.internal_user import InternalUser
    from services.iam.domain.models.organization import Organization
    from services.iam.domain.models.permission import Permission
    from services.iam.domain.models.team import Team
    from services.iam.domain.models.team_internal_user import TeamInternalUser
    from services.iam.domain.models.team_permission import TeamPermission

    async with op.acquire_db_session() as session:
        permission_campaign_reader = Permission(
            data_alias="permission_campaign_reader",
            reference="e3e83877-6791-44c1-947d-1e72202c3547",
            identifier_key="CAMPAIGN_READER",
        )
        permission_campaign_editor = Permission(
            data_alias="permission_campaign_editor",
            reference="3ffeda03-fcc0-442f-ab40-2edb4caec422",
            identifier_key="CAMPAIGN_EDITOR",
        )
        permission_appointment_reader = Permission(
            data_alias="permission_appointment_reader",
            reference="e2b7366b-f8eb-4e1c-8f3f-cfc3842228aa",
            identifier_key="APPOINTMENT_READER",
        )
        permission_appointment_editor = Permission(
            data_alias="permission_appointment_editor",
            reference="a522d335-faa0-4e41-abeb-329d29287d8e",
            identifier_key="APPOINTMENT_EDITOR",
        )
        permission_visit_reader = Permission(
            data_alias="permission_visit_reader",
            reference="93d35d30-58dd-4d0a-b238-7bbb8de8fdd0",
            identifier_key="VISIT_READER",
        )
        permission_visit_editor = Permission(
            data_alias="permission_visit_editor",
            reference="98d881e5-e8ad-4618-89e0-6ad5a731ee3d",
            identifier_key="VISIT_EDITOR",
        )
        permission_emr_reader = Permission(
            data_alias="permission_emr_reader",
            reference="9ad0bc8e-1e70-4cbe-a75b-c82f9db3d54d",
            identifier_key="EMR_READER",
        )
        permission_emr_editor = Permission(
            data_alias="permission_emr_editor",
            reference="ccb4092d-77ac-4c0d-87cf-beb5cd7b0a48",
            identifier_key="EMR_EDITOR",
        )
        permission_referral_reader = Permission(
            data_alias="permission_referral_reader",
            reference="7a563ae5-24b6-44ba-bc0b-de4fb88386e3",
            identifier_key="REFERRAL_READER",
        )
        permission_referral_editor = Permission(
            data_alias="permission_referral_editor",
            reference="1c73a385-6f05-4afe-b3e9-e555080d4f97",
            identifier_key="REFERRAL_EDITOR",
        )

        session.add(
            Organization(
                data_alias="organization_伊生股份有限公司",
                reference="094b55bd-33ff-41da-a744-0559a1a666fa",
                official_key="伊生股份有限公司",
                display_key="伊生股份有限公司",
                teams=[
                    Team(
                        data_alias="organization_伊生股份有限公司_team_marketing",
                        reference="da5b9d40-7be8-4e38-90a5-2bac62ed992d",
                        display_name="行銷團隊",
                        team_permissions=[
                            TeamPermission(permission=permission_campaign_reader),
                            TeamPermission(permission=permission_campaign_editor),
                        ],
                        team_internal_users=[
                            TeamInternalUser(
                                data_alias="organization_伊生股份有限公司_internal_user_shawn_tsou",
                                reference="23a459ba-1f1e-45e3-b9e0-423677c8641d",
                                internal_user=InternalUser(
                                    data_alias="internal_user_shawn_tsou",
                                    reference="7509e211-ac46-4b96-9cad-25f8594a9a51",
                                    first_name="翔之",
                                    last_name="鄒",
                                    email_address="shawn@esenmedical.com",
                                    password_salt="e05a18c3b4",
                                    hashed_password="8d7eff4ce6ed11ddda80c90aa234108c8960f331620510efac04bdc4bdb7afc3",
                                ),
                            ),
                            TeamInternalUser(
                                data_alias="organization_伊生股份有限公司_internal_user_minnie_lin",
                                reference="08e51536-4af2-4c1e-8122-7a40fc9d4402",
                                internal_user=InternalUser(
                                    data_alias="internal_user_minnie_lin",
                                    reference="2d26c123-317c-4359-b9e1-76e2c2a97024",
                                    first_name="品君",
                                    last_name="林",
                                    email_address="minnie@esenmedical.com",
                                    password_salt="e05a18c3b4",
                                    hashed_password="9d5c813ecad854f7e2cb9cb5107582338f541cfaaaf49b1e331b1d70a518e14d",
                                ),
                            ),
                        ],
                    )
                ],
            )
        )
        session.add(
            Organization(
                data_alias="organization_伊生診所",
                reference="0cbc6a66-4c84-4b8c-9534-0e000b1d26dc",
                official_key="伊生診所",
                display_key="伊生診所",
                branch_key="大安店",
                correspondence_address="台北市大安區忠孝東路四段216巷32弄15號1樓",
                banner_src="https://i.imgur.com/PaqubEK.jpeg",
                phone_number="(02)2775-1301",
                teams=[
                    Team(
                        data_alias="organization_伊生診所_team_doctor",
                        reference="e8e4894f-8e8e-4a70-9d41-4b41cf87aa91",
                        display_name="醫師團隊",
                        team_permissions=[
                            TeamPermission(permission=permission_visit_reader),
                            TeamPermission(permission=permission_visit_editor),
                            TeamPermission(permission=permission_appointment_reader),
                            TeamPermission(permission=permission_appointment_editor),
                            TeamPermission(permission=permission_emr_reader),
                            TeamPermission(permission=permission_emr_editor),
                            TeamPermission(permission=permission_referral_reader),
                            TeamPermission(permission=permission_referral_editor),
                        ],
                        team_internal_users=[
                            TeamInternalUser(
                                data_alias="organization_伊生診所_internal_user_wilson_tsou",
                                reference="6ad7434c-8688-4bf9-b85e-bdf1ec95b3f1",
                                internal_user=InternalUser(
                                    data_alias="internal_user_wilson_tsou",
                                    reference="d7090985-a958-4b2d-a9ee-2a60ed74fe86",
                                    first_name="為之",
                                    last_name="鄒",
                                    email_address="wilson@esenmedical.com",
                                    password_salt="e05a18c3b4",
                                    hashed_password="17efff62b50423934a7a8dc7e56ac36436efeeefbacb83bd6d4d814b0066d57c",
                                    avatar_src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png",
                                    education="布拉格查理大學第一醫學院醫學系",
                                    biography="前國泰綜合醫院醫師，走出慢性過敏、失眠焦慮主治自律神經失調，過敏免疫，失眠焦慮。",
                                ),
                            ),
                            TeamInternalUser(
                                data_alias="organization_伊生診所_internal_user_莊子璇",
                                reference="b52ef5de-4821-494b-804f-1ef1d39dda93",
                                internal_user=InternalUser(
                                    data_alias="internal_user_莊子璇",
                                    reference="92767711-f37d-41da-b5e1-6545622bf2ec",
                                    first_name="子璇",
                                    last_name="莊",
                                    email_address="5556987p@gmail.com",
                                    password_salt="e05a18c3b4",
                                    hashed_password="17efff62b50423934a7a8dc7e56ac36436efeeefbacb83bd6d4d814b0066d57c",
                                    avatar_src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/63219415ef89be3965f1b2a6_%E8%8E%8A%E5%AD%90%E7%92%87%E9%86%AB%E5%B8%AB.png",
                                    education="高雄醫學大學醫學系",
                                    biography="前新光醫院家醫科總醫師，親身減重15公斤，針對藥物、無藥減重。",
                                ),
                            ),
                        ],
                    )
                ],
            )
        )


async def downgrade(op: DataMigration.Operation):
    raise NotImplemented
