def get_normalized_phone_number(phone_number: str) -> str:
    country_code = None
    identification_code = None
    digit_only_phone_number = "".join([c for c in phone_number if c.isdigit()])
    if len(digit_only_phone_number) == 10 and digit_only_phone_number[0:2] == "09":
        country_code = "+886"
        identification_code = digit_only_phone_number[1:]
    elif len(digit_only_phone_number) == 9 and digit_only_phone_number[0] == "9":
        country_code = "+886"
        identification_code = digit_only_phone_number
    elif len(digit_only_phone_number) == 12 and digit_only_phone_number[0:4] == "8869":
        country_code = "+886"
        identification_code = digit_only_phone_number[3:]
    elif len(digit_only_phone_number) == 13 and digit_only_phone_number[0:5] == "88609":
        country_code = "+886"
        identification_code = digit_only_phone_number[4:]

    if country_code is None or identification_code is None:
        return phone_number
    else:
        return f"{country_code}{identification_code}"
