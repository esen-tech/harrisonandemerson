import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import Grid from '@esen/essence/components/Grid'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import endOfMonth from 'date-fns/endOfMonth'
import endOfWeek from 'date-fns/endOfWeek'
import format from 'date-fns/format'
import startOfMonth from 'date-fns/startOfMonth'
import startOfWeek from 'date-fns/startOfWeek'
import subMonths from 'date-fns/subMonths'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledGrid = styled(Grid)`
  padding: 0 var(--es-theme-space-padding-m);
`

const StyledDate = styled.div`
  text-align: center;
`

const StyledLabel = styled(Label)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  width: 40px;
  height: 40px;

  ${({ disabled }) => {
    if (!disabled) {
      return `
        background-color: var(--es-theme-bg-tertiary-default);
      `
    }
  }}

  ${({ $active }) => {
    if ($active) {
      return `
        border: 1.75px solid var(--es-theme-border-primary-selected);
      `
    }
  }}
`

const MonthlyCalendar = ({
  isGoPrevDisabled,
  isGoNextDisabled,
  isDateSelectable,
  isDateActive,
  onSelectDate,
  onMonthChange,
}) => {
  const [currentStartOfMonth, setCurrentStartOfMonth] = useState(
    startOfMonth(new Date())
  )
  const [currentEndOfMonth, setCurrentEndOfMonth] = useState(
    endOfMonth(currentStartOfMonth)
  )
  const [dates, setDates] = useState([])

  const handleGoPrevMonthClick = () => {
    setCurrentStartOfMonth(startOfMonth(subMonths(currentStartOfMonth, 1)))
  }
  const handleGoNextMonthClick = () => {
    setCurrentStartOfMonth(startOfMonth(addMonths(currentStartOfMonth, 1)))
  }

  useEffect(() => {
    onMonthChange?.(currentStartOfMonth)
    setCurrentEndOfMonth(endOfMonth(currentStartOfMonth))
  }, [currentStartOfMonth])

  useEffect(() => {
    const currentStartOfWeek = startOfWeek(currentStartOfMonth, {
      weekStartsOn: 1,
    })
    const currentStartOfNextViewport = startOfWeek(
      addDays(
        endOfWeek(endOfMonth(currentStartOfMonth), { weekStartsOn: 1 }),
        1
      )
    )
    let dates = []
    for (
      let date = currentStartOfWeek;
      date <= currentStartOfNextViewport;
      date = addDays(date, 1)
    ) {
      dates.push(date)
    }
    setDates(dates)
  }, [currentStartOfMonth])

  return (
    <>
      <Spacer ySize="l" />
      <Stack gap="s">
        <Container fluid squished>
          <Inline justifyContent="space-between">
            <Heading size="s">
              {format(currentStartOfMonth, 'MMMM yyyy')}
            </Heading>
            <Inline gap="l">
              <Text
                pointer
                disabled={isGoPrevDisabled?.(currentStartOfMonth)}
                onClick={handleGoPrevMonthClick}
              >
                <Icon name="chevron_left" sizeInPixel={24} />
              </Text>
              <Text
                pointer
                disabled={isGoNextDisabled?.(currentStartOfMonth)}
                onClick={handleGoNextMonthClick}
              >
                <Icon name="chevron_right" sizeInPixel={24} />
              </Text>
            </Inline>
          </Inline>
        </Container>
        <Divider indention="all" />

        <StyledGrid fluid columns={7}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => (
            <Text key={w} align="center" size="s" variant="tertiary">
              {w}
            </Text>
          ))}
        </StyledGrid>

        <StyledGrid fluid columns={7} rowGap="s" columnGap="s">
          {dates.map((date) => {
            const isSelectable = isDateSelectable?.(date)
            const isActive = isDateActive?.(date)
            return (
              <StyledDate key={format(date, 'yyyy-MM-dd')}>
                {currentStartOfMonth <= date && date <= currentEndOfMonth && (
                  <StyledLabel
                    key={format(date, 'yyyy-MM-dd')}
                    size="xs"
                    pointer
                    disabled={!isSelectable}
                    $active={isActive}
                    onClick={() => isSelectable && onSelectDate?.(date)}
                  >
                    {format(date, 'dd')}
                  </StyledLabel>
                )}
              </StyledDate>
            )
          })}
        </StyledGrid>
      </Stack>
      <Spacer ySize="l" />
    </>
  )
}

export default MonthlyCalendar
