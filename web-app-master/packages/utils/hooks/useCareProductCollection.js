import { createContext, useContext, useState } from 'react'
import { useDebounceQueue } from './useDebounceQueue'

const CareProductCollectionContext = createContext()

export const useCareProductCollection = () =>
  useContext(CareProductCollectionContext)

export const CareProductCollectionProvider = ({ apiAgent, children }) => {
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
    await apiAgent.get('/product/care_products', {
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
    <CareProductCollectionContext.Provider
      value={{
        map: entityMap,
        addReference: enqueue,
      }}
    >
      {children}
    </CareProductCollectionContext.Provider>
  )
}
