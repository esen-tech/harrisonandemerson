import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'

const EndUserContext = createContext()

export const useEndUser = () => {
  const { endUser, setEndUser, fetchEndUser } = useContext(EndUserContext)
  return { endUser, setEndUser, fetchEndUser }
}

export const EndUserProvider = ({ apiAgent, children }) => {
  const router = useRouter()
  const [endUser, setEndUser] = useState()

  async function fetchEndUser() {
    await apiAgent.get('/iam/end_users/me', {
      onError: () => {
        router.replace('/login')
      },
      onFail: (_status, _data, res) => {
        const WHITE_LIST = [
          '/login',
          '/signup',
          '/shop',
          '/shop/care_products/[care_product_reference]',
        ]
        if (res.status === 401 && !WHITE_LIST.includes(router.pathname)) {
          router.replace({
            pathname: '/login',
            // query: {
            //   next: router.asPath,
            // },
          })
        }
      },
      onSuccess: (data) => {
        setEndUser(data)
      },
    })
  }

  useEffect(() => {
    fetchEndUser()
  }, [])

  return (
    <EndUserContext.Provider value={{ endUser, setEndUser, fetchEndUser }}>
      {children}
    </EndUserContext.Provider>
  )
}
