import Image from '@esen/essence/components/Image'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { get_full_name } from '@esen/utils/fn'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import OrganizationAdminPageLayout from '../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../components/Page'
import CellDropdownSelect from '../../../../components/table/CellDropdownSelect'
import { IDENTIFIER_KEY } from '../../../../constants/permission'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const TargetMap = {
  ORGANIZATION: '組織管理',
  TEAM: '團隊管理',
  INTERNAL_USER: '人員管理',
  PERMISSION: '權限管理',
  END_USER: '客戶管理',
  MARKETING: '行銷管理',
  EMR: '病歷管理',
}

function splitIdentifierKey(identifierKey, delimiter = '_') {
  const parts = identifierKey.split(delimiter)
  return [parts.slice(0, -1).join(delimiter), parts[parts.length - 1]]
}

function getPermissionMap(permissions) {
  return permissions.reduce((m, p) => {
    const [target, role] = splitIdentifierKey(p.identifier_key)
    if (!(target in m)) {
      m[target] = []
    }
    m[target].push(role)
    return m
  }, {})
}

function getPermissionByIdentifierKey(permissions, identifierKey) {
  return permissions.find((p) => p.identifier_key === identifierKey)
}

const AdminPermissionsPage = () => {
  const [permissions, set_permissions] = useState([])
  const [teams, set_teams] = useState([])
  const [team_map, set_team_map] = useState({})
  const router = useRouter()
  const { identifierKeys } = useInternalUser()
  const { organization_uuid } = router.query

  const fetchTeam = async (teamReference) => {
    await harrisonApiAgent.get(
      `/iam/organizations/${organization_uuid}/teams/${teamReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_team_map((m) => ({ ...m, [teamReference]: data }))
        },
      }
    )
  }

  useEffect(() => {
    async function fetchPermissions() {
      await harrisonApiAgent.get('/iam/permissions', {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_permissions(
            data.sort((a, b) => a.display_sequence - b.display_sequence)
          )
        },
      })
    }
    fetchPermissions()
  }, [])

  useEffect(() => {
    async function fetchTeams() {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization_uuid}/teams`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            set_teams(enhanced_data)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchTeams()
    }
  }, [organization_uuid])

  useEffect(() => {
    teams.forEach(async (team) => {
      await fetchTeam(team.reference)
    })
  }, [teams])

  const handleUpdateTeamPermission = async (team, target, v) => {
    const permissionsOfCurrentTeam = team.team_permissions.map(
      (tp) => tp.permission
    )
    const unaffectedPermissions = permissionsOfCurrentTeam.filter(
      (p) => splitIdentifierKey(p.identifier_key)[0] !== target
    )

    let affectedPermissions = []
    switch (v) {
      case '可檢視': {
        affectedPermissions = [
          getPermissionByIdentifierKey(permissions, `${target}_READER`),
        ]
        break
      }
      case '可編輯': {
        affectedPermissions = [
          getPermissionByIdentifierKey(permissions, `${target}_READER`),
          getPermissionByIdentifierKey(permissions, `${target}_EDITOR`),
        ]
        break
      }
      case '無權限': {
        break
      }
    }
    const newPermissions = [...unaffectedPermissions, ...affectedPermissions]

    await harrisonApiAgent.put(
      `/iam/organizations/${organization_uuid}/teams/${team.reference}/team_permissions`,
      newPermissions.map((p) => ({
        permission_reference: p.reference,
      })),
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          fetchTeam(team.reference)
        },
      }
    )
  }

  const permissionMap = getPermissionMap(permissions)

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header title="權限管理" />
        <Page.Section size={false} horizontalScrollable transparent>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent leftSticky borderRight />
                {Object.keys(permissionMap).map((target) => (
                  <Table.Th key={target}>
                    <Label size="s" variant="tertiary">
                      {TargetMap[target]}
                    </Label>
                  </Table.Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(team_map).map((team) => {
                const teamPermissionMap = getPermissionMap(
                  team.team_permissions.map((tp) => tp.permission)
                )
                const displayRoles = Object.keys(permissionMap).map(
                  (target) =>
                    ({
                      1: '可檢視',
                      2: '可編輯',
                    }[teamPermissionMap[target]?.length] || '無權限')
                )
                return (
                  <React.Fragment key={team.reference}>
                    <tr>
                      <Table.Th leftIndent leftSticky borderRight>
                        <Label size="s" variant="tertiary">
                          {team.display_name}
                        </Label>
                      </Table.Th>
                      {Object.keys(permissionMap).map((target, i) => (
                        <Table.Th key={target}>
                          {identifierKeys.includes(
                            IDENTIFIER_KEY.PERMISSION_EDITOR
                          ) ? (
                            <CellDropdownSelect
                              value={displayRoles[i]}
                              options={[
                                { label: '可檢視', value: '可檢視' },
                                { label: '可編輯', value: '可編輯' },
                                { label: '無權限', value: '無權限' },
                              ]}
                              onChange={(v) =>
                                handleUpdateTeamPermission(team, target, v)
                              }
                            />
                          ) : (
                            <Label size="s" disabled>
                              {displayRoles[i]}
                            </Label>
                          )}
                        </Table.Th>
                      ))}
                    </tr>

                    {team.team_internal_users.map((tiu) => (
                      <tr key={tiu.reference}>
                        <Table.Td leftIndent leftSticky borderRight>
                          <Inline gap="s" alignItems="center">
                            <Image
                              rounded
                              width={24}
                              height={24}
                              src={tiu.internal_user.avatar_src}
                            />
                            <Text size="s" wrap={false}>
                              {get_full_name(tiu.internal_user)}
                            </Text>
                          </Inline>
                        </Table.Td>
                        {Object.keys(permissionMap).map((target, i) => (
                          <Table.Td key={target} disabled>
                            <Text size="s">{displayRoles[i]}</Text>
                          </Table.Td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <Table.Td crossRow />
                    </tr>
                    <tr>
                      <Table.Td crossRow transparent />
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </Table>
        </Page.Section>
      </Page>
    </OrganizationAdminPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AdminPermissionsPage
