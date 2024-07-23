import { createContext, useContext, useState } from 'react'
import { useDebounceQueue } from './useDebounceQueue'

const InternalUserCollectionContext = createContext()

export const useInternalUserCollection = () =>
  useContext(InternalUserCollectionContext)

export const InternalUserCollectionProvider = ({ apiAgent, children }) => {
  const [entityMap, setEntityMap] = useState({})
  const { enqueue } = useDebounceQueue(async (references) => {
    const referenceSet = references.reduce((s, reference) => {
      if (!(reference in entityMap)) {
        s.add(reference)
      }
      return s
    }, new Set())
    if (referenceSet.size === 0) {
      return
    }
    await apiAgent.get('/iam/internal_users', {
      params: {
        references: Array.from(referenceSet),
      },
      onSuccess: (data) => {
        setEntityMap({
          ...data.reduce((m, entity) => {
            m[entity.reference] = entity
            return m
          }, entityMap),
        })
      },
    })
  }, 100)

  return (
    <InternalUserCollectionContext.Provider
      value={{
        map: entityMap,
        addReference: enqueue,
      }}
    >
      {children}
    </InternalUserCollectionContext.Provider>
  )
}
