import { format, parseISO, subMinutes } from 'date-fns'

export const get_organization_name = (organization) => {
  if (!organization) {
    return ''
  }
  if (!organization.display_key) {
    return ''
  }
  if (organization.branch_key) {
    return `${organization.display_key}（${organization.branch_key}）`
  } else {
    return organization.display_key
  }
}

export const get_full_name = (
  user,
  { firstNameKey = 'first_name', lastNameKey = 'last_name' } = {}
) => {
  if (!user) {
    return ''
  }
  if (!user[firstNameKey] && !user[lastNameKey]) {
    return ''
  }
  if (/^[a-zA-Z]+$/.test(user.first_name)) {
    return `${user[firstNameKey]} ${user[lastNameKey]}`
  } else {
    return `${user[lastNameKey]}${user[firstNameKey]}`
  }
}

export const get_user_email = (user_emails) => {
  if (!user_emails) {
    return 'N/A'
  } else if (user_emails.length === 0) {
    return 'N/A'
  } else {
    return user_emails[0].email_address
  }
}

export const get_user_phone = (user_phones) => {
  if (!user_phones) {
    return 'N/A'
  } else if (user_phones.length === 0) {
    return 'N/A'
  } else {
    return user_phones[0].phone_number
  }
}

export const local_to_utc = (iso_local_datetime) => {
  const start_time = new Date(iso_local_datetime)
  return start_time.toISOString().substring(0, 19)
}

export const get_local_datetime = (iso_utc_datetime, fmt) => {
  if (!iso_utc_datetime) {
    return new Date().toISOString().substring(0, 19)
  }
  const date = new Date(parseISO(iso_utc_datetime))
  return format(
    subMinutes(date, date.getTimezoneOffset()),
    fmt || "yyyy-MM-dd'T'HH:mm:ss"
  )
}

export const moveToFirstBy = (data, fn) => {
  const idx = data.findIndex(fn)
  if (idx === -1) {
    return data
  }
  return [data[idx], ...data.slice(0, idx), ...data.slice(idx + 1)]
}

// https://toolsnull.com/code-solution/how-to-write-prices-in-comma-separated-in-javascript
export const getCommaSeparatedNumber = (number) => {
  if (!number) {
    return null
  }
  let parts = number.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}
