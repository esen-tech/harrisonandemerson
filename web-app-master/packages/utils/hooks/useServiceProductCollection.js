import { createContext, useContext, useState } from 'react'
import { useDebounceQueue } from './useDebounceQueue'

const ServiceProductCollectionContext = createContext()

export const useServiceProductCollection = () =>
  useContext(ServiceProductCollectionContext)

export const ServiceProductCollectionProvider = ({ apiAgent, children }) => {
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
    await apiAgent.get('/product/service_products', {
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
  const addEntity = (entity) => {
    setEntityMap((entityMap) => ({ ...entityMap, [entity.reference]: entity }))
  }

  return (
    <ServiceProductCollectionContext.Provider
      value={{
        map: entityMap,
        addReference: enqueue,
        addEntity,
      }}
    >
      {children}
    </ServiceProductCollectionContext.Provider>
  )
}
