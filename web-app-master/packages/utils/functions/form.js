import { FieldTypeEnum, FieldVariantTypeEnum } from '@esen/utils/constants/form'

export const normalize_field = (fieldMeta, fieldRecord) => {
  const normalizedFieldRecord = { ...fieldRecord }
  if (
    fieldMeta.field_variant_type === FieldVariantTypeEnum.PERCENTAGE &&
    fieldMeta.field_type === FieldTypeEnum.INTEGER
  ) {
    normalizedFieldRecord.integer_value =
      parseInt(normalizedFieldRecord.integer_value) / 100
  } else if (
    fieldMeta.field_variant_type === FieldVariantTypeEnum.PERCENTAGE &&
    fieldMeta.field_type === FieldTypeEnum.NUMERIC
  ) {
    normalizedFieldRecord.numeric_value = `${
      parseFloat(normalizedFieldRecord.numeric_value) / 100
    }`
  }
  return normalizedFieldRecord
}

export const denormalize_field = (fieldMeta, fieldRecord) => {
  const denormalizedFieldRecord = { ...fieldRecord }
  if (
    fieldMeta.field_variant_type === FieldVariantTypeEnum.PERCENTAGE &&
    fieldMeta.field_type === FieldTypeEnum.INTEGER
  ) {
    denormalizedFieldRecord.integer_value =
      denormalizedFieldRecord.integer_value * 100
  } else if (
    fieldMeta.field_variant_type === FieldVariantTypeEnum.PERCENTAGE &&
    fieldMeta.field_type === FieldTypeEnum.NUMERIC
  ) {
    denormalizedFieldRecord.numeric_value = `${
      parseFloat(denormalizedFieldRecord.numeric_value) * 100
    }`
  }
  return denormalizedFieldRecord
}

export const normalize_phone_number = (countryCode, nationalPhoneNumber) => {
  return `${countryCode}${nationalPhoneNumber?.replace(/^0+/, '')}`
}
