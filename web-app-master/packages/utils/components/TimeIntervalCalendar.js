import Container from '@esen/essence/components/Container'
import Grid from '@esen/essence/components/Grid'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import format from 'date-fns/format'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledDate = styled.div`
  padding: var(--es-theme-space-padding-squished-xl);
  border-radius: var(--es-border-radius-0);
  text-align: center;
  background-color: var(--es-theme-bg-tertiary-default);

  &,
  & * {
    cursor: pointer;
  }

  ${({ $active }) => {
    if ($active) {
      return `
        border: 1.75px solid var(--es-theme-border-primary-selected);
      `
    } else {
      return `
        border: 1.75px solid transparent;
      `
    }
  }}
`

const TimeIntervalCalendar = ({
  title,
  selectableTimeSlots,
  isGoPrevTimeDisabled,
  isGoNextTimeDisabled,
  isDateActive,
  onSelectDate,
}) => {
  const [batchOfTimeSlots, setBatchOfTimeSlots] = useState([[]])
  const [currentBatch, setCurrentBatch] = useState(0)

  useEffect(() => {
    setCurrentBatch(0)
  }, [selectableTimeSlots])

  useEffect(() => {
    let batches = []
    const CHUNK_SIZE = 8
    for (
      let i = 0;
      i < Math.ceil(selectableTimeSlots.length / CHUNK_SIZE);
      i++
    ) {
      batches.push(
        selectableTimeSlots.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      )
    }

    setBatchOfTimeSlots(batches)
  }, [selectableTimeSlots])

  const handleGoPrevMonthClick = () => {
    setCurrentBatch(Math.max(0, currentBatch - 1))
  }
  const handleGoNextMonthClick = () => {
    setCurrentBatch(Math.min(batchOfTimeSlots.length - 1, currentBatch + 1))
  }

  return (
    <Container>
      <Stack gap="m">
        <Inline fluid justifyContent="space-between">
          <Heading size="s">{title}</Heading>
          <Inline gap="l">
            <Text
              pointer
              disabled={isGoPrevTimeDisabled?.(currentBatch, batchOfTimeSlots)}
              onClick={handleGoPrevMonthClick}
            >
              <Icon name="chevron_left" sizeInPixel={24} />
            </Text>
            <Text
              pointer
              disabled={isGoNextTimeDisabled?.(currentBatch, batchOfTimeSlots)}
              onClick={handleGoNextMonthClick}
            >
              <Icon name="chevron_right" sizeInPixel={24} />
            </Text>
          </Inline>
        </Inline>
        <Grid fluid columns={4} columnGap="s" rowGap="s">
          {batchOfTimeSlots?.[currentBatch]?.map((ts) => {
            const isActive = isDateActive?.(ts.startTime)
            return (
              <StyledDate
                key={format(ts.startTime, 'HH:mm')}
                $active={isActive}
                onClick={() => onSelectDate?.(ts.startTime)}
              >
                <Label size="xs" align="center">
                  {format(ts.startTime, 'HH:mm')}
                </Label>
              </StyledDate>
            )
          })}
        </Grid>
      </Stack>
    </Container>
  )
}

export default TimeIntervalCalendar
