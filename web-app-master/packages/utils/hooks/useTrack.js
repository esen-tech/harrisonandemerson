import mixpanel from 'mixpanel-browser'
import { createContext, useCallback, useContext } from 'react'

const TrackContext = createContext({})

const useTrack = () => {
  const { enabled } = useContext(TrackContext)
  const track = useCallback(
    (eventName, properties = {}, ...rest) => {
      if (enabled) {
        mixpanel.track(eventName, properties, ...rest)
      }
    },
    [enabled]
  )
  return [track]
}

export const TrackProvider = ({ enabled, children }) => {
  return (
    <TrackContext.Provider value={{ enabled }}>
      {children}
    </TrackContext.Provider>
  )
}

export default useTrack
