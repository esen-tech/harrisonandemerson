import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'
import { useInternalUser } from './useInternalUser'

const OrganizationContext = createContext()

export const useCurrentOrganization = () => {
  const { organizations, organization } = useContext(OrganizationContext)
  return { organizations, organization }
}

export const CurrentOrganizationProvider = ({ apiAgent, children }) => {
  const router = useRouter()
  const { internalUser } = useInternalUser()
  const [organizations, setOrganizations] = useState([])
  const [organization, setOrganization] = useState()
  const { organization_uuid } = router.query

  useEffect(() => {
    async function fetchOrganizations() {
      await apiAgent.get('/iam/internal_users/me/organizations', {
        onSuccess: (data) => {
          setOrganizations(data)
        },
      })
    }
    if (internalUser) {
      fetchOrganizations()
    }
  }, [apiAgent, internalUser])

  useEffect(() => {
    if (internalUser && organization_uuid) {
      const org = organizations.find((o) => o.reference === organization_uuid)
      if (org) {
        setOrganization(org)
      }
    }
  }, [apiAgent, internalUser, organization_uuid, organizations])

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        organization,
        setOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}
