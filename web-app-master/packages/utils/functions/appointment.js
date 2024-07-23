import addMinutes from 'date-fns/addMinutes'
import isEqual from 'date-fns/isEqual'
import subHours from 'date-fns/subHours'
import subMinutes from 'date-fns/subMinutes'

export const getQuantizedTimeSlots = (timeSlots, intervalInMinutes) => {
  // merge continuous time slots
  let mergedTimeSlots = []
  const sortedTimeSlots = timeSlots.sort((a, b) => {
    if (a.startTime < b.startTime) {
      return -1
    } else if (a.startTime > b.startTime) {
      return 1
    } else {
      return 0
    }
  })
  if (sortedTimeSlots.length > 0) {
    let currentTimeSlot = sortedTimeSlots[0]
    let i
    for (i = 0; i < sortedTimeSlots.length - 1; i++) {
      if (
        isEqual(sortedTimeSlots[i].endTime, sortedTimeSlots[i + 1].startTime)
      ) {
        continue
      } else {
        mergedTimeSlots.push({
          startTime: currentTimeSlot.startTime,
          endTime: sortedTimeSlots[i].endTime,
        })
        currentTimeSlot = sortedTimeSlots[i + 1]
      }
    }
    mergedTimeSlots.push({
      startTime: currentTimeSlot.startTime,
      endTime: sortedTimeSlots[i].endTime,
    })
  }

  // quantize by interval
  let quantizedDatetimes = []
  mergedTimeSlots.forEach((ts) => {
    const endTime = subMinutes(ts.endTime, intervalInMinutes)
    for (
      let date = ts.startTime;
      date <= endTime;
      date = addMinutes(date, intervalInMinutes)
    ) {
      quantizedDatetimes.push({
        startTime: date,
        endTime: addMinutes(date, intervalInMinutes),
      })
    }
  })

  return quantizedDatetimes
}

export const getFilteredTimeSlots = (timeSlots, availableOffsetInHours) => {
  const localNow = new Date()
  return timeSlots.filter(
    (ts) => localNow < subHours(ts.startTime, availableOffsetInHours)
  )
}
