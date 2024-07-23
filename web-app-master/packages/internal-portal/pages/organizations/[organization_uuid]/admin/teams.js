import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { FilterTypes } from '@esen/utils/constants/organization_internal_user'
import { EMPLOYMENT_STATE } from '@esen/utils/constants/state'
import { get_full_name } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import OrganizationAdminPageLayout from '../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../components/Page'
import SidePanel from '../../../../components/SidePanel'
import { IDENTIFIER_KEY } from '../../../../constants/permission'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const EditTeamInternalUserStage = {
  VIEW_OR_DELETE_INTERNAL_USERS: 'VIEW_OR_DELETE_INTERNAL_USERS',
  ADD_INTERNAL_USERS: 'ADD_INTERNAL_USERS',
}

const AdminTeamsPage = () => {
  const paginator = usePaginator()
  const [teams, set_teams] = useState([])
  const [active_team, set_active_team] = useState()
  const [activeTeamReference, setActiveTeamReference] = useState()
  const [editTeamInternalUserStage, setEditTeamInternalUserStage] = useState(
    EditTeamInternalUserStage.VIEW_OR_DELETE_INTERNAL_USERS
  )
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showUpdateTeamModal, setShowUpdateTeamModal] = useState(false)
  const [showEditTeamInternalUserModal, setShowEditTeamInternalUserModal] =
    useState(false)
  const { identifierKeys } = useInternalUser()
  const router = useRouter()
  const createTeamForm = useForm()
  const updateTeamForm = useForm()
  const createTeamInternalUsersForm = useForm()
  const { organization_uuid } = router.query
  const watchCreateTeamDisplayName = createTeamForm.watch('display_name')
  const watchUpdateTeamDisplayName = updateTeamForm.watch('display_name')
  const watchInternalUserReferences = createTeamInternalUsersForm.watch(
    'internal_user_references'
  )

  async function fetchTeam(teamReference) {
    await harrisonApiAgent.get(
      `/iam/organizations/${organization_uuid}/teams/${teamReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_active_team(data)
        },
      }
    )
  }

  useEffect(() => {
    async function fetchTeams() {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization_uuid}/teams`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_teams(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchTeams()
    }
  }, [organization_uuid, paginator.activePageToken])

  useEffect(() => {
    if (activeTeamReference) {
      fetchTeam(activeTeamReference)
    }
  }, [activeTeamReference])

  const handleHideCreateTeamModal = () => {
    setShowCreateTeamModal(false)
    createTeamForm.reset({ display_name: null })
  }

  const handleHideUpdateTeamModal = () => {
    setShowUpdateTeamModal(false)
    updateTeamForm.reset({ display_name: null, display_responsibility: null })
  }

  const handleHideEditTeamInternalUserModal = () => {
    setShowEditTeamInternalUserModal(false)
    setEditTeamInternalUserStage(
      EditTeamInternalUserStage.VIEW_OR_DELETE_INTERNAL_USERS
    )
  }

  const handleDeleteTeamInternalUser = async (team_internal_user) => {
    await harrisonApiAgent.delete(
      `/iam/organizations/${organization_uuid}/teams/${activeTeamReference}/team_internal_users/${team_internal_user.reference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          fetchTeam(activeTeamReference)
        },
      }
    )
  }

  const handleSubmitCreateTeamForm = async (payload) => {
    await harrisonApiAgent.post(
      `/iam/organizations/${organization_uuid}/teams`,
      {
        ...payload,
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.reload()
        },
      }
    )
  }

  const handleSubmitUpdateTeamForm = async (payload) => {
    await harrisonApiAgent.patch(
      `/iam/organizations/${organization_uuid}/teams/${activeTeamReference}`,
      {
        ...payload,
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.reload()
        },
      }
    )
  }

  const handleSubmitCreateTeamInternalUsersForm = async (payload) => {
    let failedMessages = []
    async function createTeamInternalUser(internalUserReference) {
      await harrisonApiAgent.post(
        `/iam/organizations/${organization_uuid}/teams/${activeTeamReference}/team_internal_users`,
        {
          internal_user_reference: internalUserReference,
        },
        {
          onFail: (_status, data) => {
            failedMessages.push(data.message)
          },
        }
      )
    }
    Promise.all(
      payload.internal_user_references.map((internal_user_reference) =>
        createTeamInternalUser(internal_user_reference)
      )
    ).then((_values) => {
      if (failedMessages.length > 0) {
        alert(failedMessages)
      } else {
        handleHideEditTeamInternalUserModal()
        fetchTeam(activeTeamReference)
      }
    })
  }

  const handleDeleteTeamClick = async () => {
    await harrisonApiAgent.delete(
      `/iam/organizations/${organization_uuid}/teams/${activeTeamReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.reload()
        },
      }
    )
  }

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header
          title="團隊管理"
          rightControl={
            <Button
              variant="primary"
              inversed
              prefix={<Icon inversed name="add" />}
              onClick={() => setShowCreateTeamModal(true)}
            >
              新增團隊
            </Button>
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    團隊名稱
                  </Label>
                </Table.Th>
                <Table.Th rightIndent>
                  <Label size="s" variant="tertiary">
                    團隊職責
                  </Label>
                </Table.Th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <Table.Tr
                  key={team.reference}
                  pointer
                  onClick={() => setActiveTeamReference(team.reference)}
                >
                  <Table.Td leftIndent>
                    <Text size="s">{team.display_name}</Text>
                  </Table.Td>
                  <Table.Td rightIndent>
                    <Text size="s">{team.display_responsibility || 'N/A'}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <Table.Td crossRow />
              </tr>
            </tfoot>
          </Table>
        </Page.Section>
        <Page.Footer squished>
          <Inline justifyContent="space-between">
            <Inline gap="s" alignItems="center">
              <Label size="s">單頁顯示數量</Label>
              <Label size="s">{paginator.activePage?.count_per_page}</Label>
            </Inline>
            <Inline gap="xl">
              <Inline gap="s" alignItems="center">
                <Label size="s">總共</Label>
                <Label size="s">{paginator.activePage?.count_all_page}</Label>
              </Inline>
              <Inline gap="m" alignItems="center">
                <Icon
                  name="navigate_before"
                  sizeInPixel={20}
                  pointer
                  onClick={paginator.goPrev}
                  disabled={paginator.isPrevDisabled()}
                />
                <Icon
                  name="navigate_next"
                  sizeInPixel={20}
                  pointer
                  onClick={paginator.goNext}
                  disabled={paginator.isNextDisabled(
                    (defaultIsNextDisabled, previousPages) => {
                      const isLastPage =
                        previousPages.length *
                          (paginator.activePage?.count_per_page || 0) +
                          teams.length ===
                        paginator.activePage?.count_all_page
                      return defaultIsNextDisabled || isLastPage
                    }
                  )}
                />
              </Inline>
            </Inline>
          </Inline>
        </Page.Footer>

        {activeTeamReference && (
          <Page.SidePanel
            title={active_team?.display_name}
            onClose={() => setActiveTeamReference()}
          >
            <SidePanel.Section title="團隊職責">
              <Container>
                {active_team?.display_responsibility || 'N/A'}
              </Container>
            </SidePanel.Section>
            <SidePanel.Section
              title="團隊成員"
              control={
                identifierKeys.includes(IDENTIFIER_KEY.TEAM_EDITOR) && (
                  <Label
                    size="xs"
                    variant="info"
                    pointer
                    onClick={() => setShowEditTeamInternalUserModal(true)}
                  >
                    編輯
                  </Label>
                )
              }
            >
              <Container>
                {active_team?.team_internal_users.map((tiu) => (
                  <ListItem key={tiu.reference} verticallyCentered>
                    <ListItem.Media
                      image={{
                        src: tiu.internal_user.avatar_src,
                      }}
                    />
                    <ListItem.Content
                      title={get_full_name(tiu.internal_user)}
                    />
                  </ListItem>
                ))}
              </Container>
            </SidePanel.Section>

            {identifierKeys.includes(IDENTIFIER_KEY.TEAM_EDITOR) && (
              <SidePanel.Section title="團隊設定">
                <Container fluid>
                  <Button
                    fluid
                    size="s"
                    onClick={() => {
                      updateTeamForm.setValue(
                        'display_name',
                        active_team.display_name
                      )
                      updateTeamForm.setValue(
                        'display_responsibility',
                        active_team.display_responsibility
                      )
                      setShowUpdateTeamModal(true)
                    }}
                  >
                    更多設定
                  </Button>
                </Container>
              </SidePanel.Section>
            )}
          </Page.SidePanel>
        )}
      </Page>

      <Modal
        show={showCreateTeamModal}
        onHide={handleHideCreateTeamModal}
        style={{
          minWidth: 400,
          borderRadius: 'var(--es-border-radius-1)',
        }}
      >
        <Container
          fluid
          size="l"
          style={{
            borderRadius: 'var(--es-border-radius-1)',
          }}
        >
          <Stack fluid gap="l">
            <Inline fluid justifyContent="space-between">
              <Label size="l">新增團隊</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideCreateTeamModal}
              />
            </Inline>
            <Stack fluid>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  團隊名稱
                </Label>
                <Input
                  fluid
                  placeholder="填入團隊名稱"
                  {...createTeamForm.register('display_name')}
                />
              </Field>
            </Stack>
            <Inline fluid gap="s" justifyContent="end">
              <Button onClick={handleHideCreateTeamModal}>取消</Button>
              <Button
                inversed
                variant="primary"
                disabled={!watchCreateTeamDisplayName}
                onClick={createTeamForm.handleSubmit(
                  handleSubmitCreateTeamForm
                )}
                loading={createTeamForm.formState.isSubmitting}
              >
                確定
              </Button>
            </Inline>
          </Stack>
        </Container>
      </Modal>

      <Modal
        show={showUpdateTeamModal}
        onHide={handleHideUpdateTeamModal}
        style={{
          minWidth: 400,
          borderRadius: 'var(--es-border-radius-1)',
        }}
      >
        <Container
          fluid
          size="l"
          style={{
            borderRadius: 'var(--es-border-radius-1)',
          }}
        >
          <Stack fluid gap="l">
            <Inline fluid justifyContent="space-between">
              <Label size="l">團隊設定</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideUpdateTeamModal}
              />
            </Inline>
            <Stack fluid gap="s">
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  團隊名稱
                </Label>
                <Input
                  fluid
                  placeholder="填入團隊名稱"
                  {...updateTeamForm.register('display_name')}
                />
              </Field>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  團隊職責
                </Label>
                <Input
                  fluid
                  placeholder="填入團隊職責"
                  {...updateTeamForm.register('display_responsibility')}
                />
              </Field>
            </Stack>
            <Inline fluid justifyContent="space-between">
              <Button
                variant="negative"
                disabled={active_team?.team_internal_users?.length > 0}
                onClick={handleDeleteTeamClick}
              >
                解散團隊
              </Button>
              <Inline gap="s">
                <Button onClick={handleHideUpdateTeamModal}>取消</Button>
                <Button
                  inversed
                  variant="primary"
                  disabled={!watchUpdateTeamDisplayName}
                  onClick={updateTeamForm.handleSubmit(
                    handleSubmitUpdateTeamForm
                  )}
                  loading={updateTeamForm.formState.isSubmitting}
                >
                  確定
                </Button>
              </Inline>
            </Inline>
          </Stack>
        </Container>
      </Modal>

      <Modal
        show={showEditTeamInternalUserModal}
        onHide={handleHideEditTeamInternalUserModal}
        style={{
          minWidth: 400,
          borderRadius: 'var(--es-border-radius-1)',
        }}
      >
        <Container
          fluid
          size="l"
          style={{
            borderRadius: 'var(--es-border-radius-1)',
          }}
        >
          {editTeamInternalUserStage ===
            EditTeamInternalUserStage.VIEW_OR_DELETE_INTERNAL_USERS && (
            <Stack fluid gap="l">
              <Inline fluid justifyContent="space-between">
                <Stack>
                  <Label size="l">編輯團隊成員</Label>
                  <Text size="s" variant="tertiary">
                    {active_team?.display_name}
                  </Text>
                </Stack>
                <Icon
                  sizeInPixel={24}
                  name="close"
                  pointer
                  onClick={handleHideEditTeamInternalUserModal}
                />
              </Inline>
              <Stack fluid>
                {active_team?.team_internal_users.map((tiu) => (
                  <ListItem key={tiu.reference} verticallyCentered>
                    <ListItem.Media
                      image={{
                        src: tiu.internal_user.avatar_src,
                      }}
                    />
                    <ListItem.Content
                      title={get_full_name(tiu.internal_user)}
                    />
                    <ListItem.Control
                      icon={{
                        name: 'delete_outline',
                        variant: 'negative',
                        pointer: true,
                      }}
                      onClick={() => handleDeleteTeamInternalUser(tiu)}
                    />
                  </ListItem>
                ))}
              </Stack>
              <Button
                fluid
                onClick={() =>
                  setEditTeamInternalUserStage(
                    EditTeamInternalUserStage.ADD_INTERNAL_USERS
                  )
                }
              >
                新增團隊成員
              </Button>
            </Stack>
          )}

          {editTeamInternalUserStage ===
            EditTeamInternalUserStage.ADD_INTERNAL_USERS && (
            <Stack fluid gap="l">
              <Controller
                control={createTeamInternalUsersForm.control}
                name="internal_user_references"
                render={({ field }) => (
                  <DropdownSelect
                    fluid
                    multiple
                    placeholder="選擇團隊成員"
                    value={field.value}
                    onChange={field.onChange}
                    getOptions={async (sendOptions) => {
                      await harrisonApiAgent.get(
                        `/iam/organizations/${organization_uuid}/organization_internal_users`,
                        {
                          params: {
                            filter: {
                              type: FilterTypes.EMPLOYMENT_STATE.type,
                              query: EMPLOYMENT_STATE.EMPLOYED,
                            },
                          },
                          onFail: (_status, data) => {
                            alert(data.message)
                          },
                          onSuccess: ({
                            enhanced_data,
                            metadata: { page },
                          }) => {
                            sendOptions(
                              enhanced_data
                                .filter(
                                  (oiu) =>
                                    !active_team?.team_internal_users.find(
                                      (tiu) =>
                                        tiu.internal_user.reference ===
                                        oiu.internal_user.reference
                                    )
                                )
                                .map((oiu) => ({
                                  label: get_full_name(oiu.internal_user),
                                  value: oiu.internal_user.reference,
                                }))
                            )
                          },
                        }
                      )
                    }}
                  />
                )}
              />
              <Inline fluid gap="s" justifyContent="end">
                <Button
                  onClick={() =>
                    setEditTeamInternalUserStage(
                      EditTeamInternalUserStage.VIEW_OR_DELETE_INTERNAL_USERS
                    )
                  }
                >
                  取消
                </Button>
                <Button
                  inversed
                  variant="primary"
                  disabled={
                    !watchInternalUserReferences ||
                    watchInternalUserReferences?.length === 0
                  }
                  onClick={createTeamInternalUsersForm.handleSubmit(
                    handleSubmitCreateTeamInternalUsersForm
                  )}
                  loading={createTeamInternalUsersForm.formState.isSubmitting}
                >
                  確定
                </Button>
              </Inline>
            </Stack>
          )}
        </Container>
      </Modal>
    </OrganizationAdminPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AdminTeamsPage
