import { createContext, useContext, useState } from 'react'
import { useDebounceQueue } from './useDebounceQueue'

const DeliveryOrderCollectionContext = createContext()

export const useDeliveryOrderCollection = () =>
  useContext(DeliveryOrderCollectionContext)

export const DeliveryOrderCollectionProvider = ({ apiAgent, children }) => {
  const [entityMap, setEntityMap] = useState({})
  const [financialOrderEntityMap, setFinancialOrderEntityMap] = useState({})

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
    await apiAgent.get('/product/delivery_orders', {
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

  const financialOrderDebounceQueue = useDebounceQueue(async (references) => {
    const referenceSet = references.reduce((s, reference) => {
      if (!(reference in financialOrderEntityMap)) {
        s.add(reference)
      }
      return s
    }, new Set())
    if (referenceSet.size === 0) {
      return
    }
    await apiAgent.get('/product/delivery_orders', {
      params: {
        financial_order_references: Array.from(referenceSet),
      },
      onSuccess: (data) => {
        setFinancialOrderEntityMap({
          ...data.reduce((m, entity) => {
            m[entity.financial_order_reference] = entity
            return m
          }, financialOrderEntityMap),
        })
      },
    })
  }, 100)

  return (
    <DeliveryOrderCollectionContext.Provider
      value={{
        map: entityMap,
        financialOrderMap: financialOrderEntityMap,
        addReference: enqueue,
        addFinancialOrderReference: financialOrderDebounceQueue.enqueue,
      }}
    >
      {children}
    </DeliveryOrderCollectionContext.Provider>
  )
}
