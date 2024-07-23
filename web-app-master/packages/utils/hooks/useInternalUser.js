import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'

const InternalUserContext = createContext()

export const useInternalUser = () => {
  const { internalUser, identifierKeys, fetchInternalUser, setInternalUser } =
    useContext(InternalUserContext)
  return { internalUser, identifierKeys, fetchInternalUser, setInternalUser }
}

export const InternalUserProvider = ({ apiAgent, children }) => {
  const router = useRouter()
  const [internalUser, setInternalUser] = useState()
  const [identifierKeys, setIdentifierKeys] = useState([])

  async function fetchInternalUserPermissions() {
    await apiAgent.get('/iam/internal_users/me/permissions', {
      onSuccess: (data) => {
        setIdentifierKeys(data.map((p) => p.identifier_key))
      },
    })
  }

  async function fetchInternalUser() {
    await apiAgent.get('/iam/internal_users/me', {
      onError: () => {
        router.push('/')
      },
      onFail: (_status, _data, res) => {
        const WHITE_LIST = ['/benefits']
        if (res.status === 401 && !WHITE_LIST.includes(router.asPath)) {
          router.push('/')
        }
      },
      onSuccess: (data) => {
        setInternalUser(data)
        fetchInternalUserPermissions()
      },
    })
  }

  useEffect(() => {
    fetchInternalUser()
  }, [apiAgent])

  return (
    <InternalUserContext.Provider
      value={{
        internalUser,
        identifierKeys,
        setInternalUser,
        fetchInternalUser,
      }}
    >
      {children}
    </InternalUserContext.Provider>
  )
}
