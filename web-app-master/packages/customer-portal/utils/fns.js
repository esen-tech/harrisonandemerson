export const is_phone_number_valid = (countryCode, nationalPhoneNumber) => {
  switch (countryCode) {
    case '+886':
      return /^0?9[0-9]{8}$/.test(nationalPhoneNumber)
    default:
      return true
  }
}

export const is_otp_valid = (otp) => /^[0-9]{6}$/.test(otp)
