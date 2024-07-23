import Form, {
  getDefaultValues,
  getFieldRecords,
  getFieldVisibilityMap,
} from '@esen/components/form/Form'
import Icon from '@esen/components/Icon'
import Stepper from '@esen/components/navigation/Stepper'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import AuthLayout from '../../components/layout/AuthLayout'
import apiAgent from '../../utils/apiAgent'

const OnboardingPage = () => {
  const router = useRouter()
  const [outerActiveStep, setOuterActiveStep] = useState(0)
  const [innerActiveStep, setInnerActiveStep] = useState(0)
  const formRefMap = useRef({})
  const [form_metas, set_form_metas] = useState([])
  const [form_records, set_form_records] = useState([])
  const [formFieldVisibilityMap, setFormFieldVisibilityMap] = useState({})
  const [sorted_profile_forms, set_sorted_profile_forms] = useState([])
  const [enum_map, set_enum_map] = useState({})

  const update_sorted_profile_forms = (
    form_metas,
    form_records,
    formFieldVisibilityMap
  ) => {
    const _form_metas = form_metas.map((form_meta) => {
      const fieldVisibilityMap = formFieldVisibilityMap[form_meta.uuid] || {}
      const field_meta_section_map = form_meta.field_metas.reduce(
        (m, field_meta) => {
          if (!fieldVisibilityMap[field_meta.uuid]) {
            return m
          }
          let field_metas = m[field_meta.display_section]
          if (!field_metas) {
            field_metas = []
          }
          return {
            ...m,
            [field_meta.display_section]: [...field_metas, field_meta],
          }
        },
        {}
      )
      const sorted_field_meta_sections = Object.keys(
        field_meta_section_map
      ).sort((a, b) => parseInt(a) - parseInt(b))
      return {
        ...form_meta,
        field_meta_section_map,
        sorted_field_meta_sections,
      }
    })
    const sorted_form_metas = _form_metas.sort(
      (a, b) => a.display_sequence - b.display_sequence
    )
    const form_record_map = form_records.reduce(
      (m, fr) => ({ ...m, [fr.form_meta_uuid]: fr }),
      {}
    )
    set_sorted_profile_forms(
      sorted_form_metas.map((fm) => ({
        form_meta: fm,
        form_record: form_record_map[fm.uuid],
      }))
    )
  }

  useEffect(() => {
    async function fetch_profile_form_metas() {
      await apiAgent.get('/profile_form_metas', {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: async (fetched_form_metas) => {
          set_form_metas(fetched_form_metas)
          await apiAgent.get('/profile_form_records', {
            onFail: (status, data) => {
              alert(data.message)
            },
            onSuccess: (fetched_form_records) => {
              set_form_records(fetched_form_records)
              const form_record_map = fetched_form_records.reduce(
                (m, fr) => ({ ...m, [fr.form_meta_uuid]: fr }),
                {}
              )
              const formFieldVisibilityMap = fetched_form_metas.reduce(
                (m, fm) => {
                  const values = getDefaultValues(fm, form_record_map[fm.uuid])
                  const fieldVisibilityMap = getFieldVisibilityMap(
                    fm.field_metas,
                    values
                  )
                  return {
                    ...m,
                    [fm.uuid]: fieldVisibilityMap,
                  }
                },
                {}
              )
              setFormFieldVisibilityMap(formFieldVisibilityMap)
              update_sorted_profile_forms(
                fetched_form_metas,
                fetched_form_records,
                formFieldVisibilityMap
              )
            },
          })
        },
      })
    }
    fetch_profile_form_metas()
  }, [])

  useEffect(() => {
    const enum_option_set_uuid_set = new Set()
    form_metas.forEach((form_meta) => {
      form_meta.field_metas.forEach((field_meta) => {
        if (field_meta.enum_option_set_uuid) {
          enum_option_set_uuid_set.add(field_meta.enum_option_set_uuid)
        }
      })
    })
    async function fetch_enums() {
      await apiAgent.get('/enums', {
        params: {
          query: {
            enum_option_set_uuids: Array.from(enum_option_set_uuid_set),
          },
        },
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          const map = data.reduce(
            (m, enu) => ({
              ...m,
              [enu.enum_option_set.uuid]: {
                ...enu,
                enum_options: enu.enum_options.sort(
                  (a, b) => a.display_sequence - b.display_sequence
                ),
              },
            }),
            {}
          )
          set_enum_map(map)
        },
      })
    }
    fetch_enums()
  }, [form_metas])

  const syncProfileForm = (form_record) => {
    const existing_form_record_idx = form_records.findIndex(
      (fr) => fr.uuid === form_record.uuid
    )
    const new_form_records = existing_form_record_idx
      ? [
          ...form_records.slice(0, existing_form_record_idx),
          form_record,
          ...form_records.slice(existing_form_record_idx + 1),
        ]
      : [...form_records, form_record]
    set_form_records(new_form_records)
    const form_record_map = new_form_records.reduce(
      (m, fr) => ({ ...m, [fr.form_meta_uuid]: fr }),
      {}
    )
    const formFieldVisibilityMap = form_metas.reduce((m, fm) => {
      const values = getDefaultValues(fm, form_record_map[fm.uuid])
      const fieldVisibilityMap = getFieldVisibilityMap(fm.field_metas, values)
      return {
        ...m,
        [fm.uuid]: fieldVisibilityMap,
      }
    }, {})
    setFormFieldVisibilityMap(formFieldVisibilityMap)
    update_sorted_profile_forms(
      form_metas,
      new_form_records,
      formFieldVisibilityMap
    )
  }

  const handleSubmitForm = async ({ form_meta, form_record }, payload) => {
    const field_records = getFieldRecords(form_meta, payload)
    if (!form_record) {
      // create
      await apiAgent.post(
        '/profile_form_records',
        {
          form_meta_uuid: form_meta.uuid,
          field_records,
        },
        {
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            syncProfileForm(data)
          },
        }
      )
    } else {
      // update
      await apiAgent.patch(
        `/profile_form_records/${form_record.uuid}`,
        {
          field_records,
        },
        {
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: async (data) => {
            syncProfileForm(data)
          },
        }
      )
    }
  }

  const inferProfile = async () => {
    await apiAgent.post('/profiles/me/infer', null, {
      onFail: (status, data) => {
        alert(data.message)
      },
    })
  }

  const handlePrevClick = () => {
    const nextInnerActiveStep = Math.max(0, innerActiveStep - 1)
    if (nextInnerActiveStep === innerActiveStep) {
      const nextOuterActiveStep = Math.max(0, outerActiveStep - 1)
      const innerMaxStep =
        sorted_profile_forms[nextOuterActiveStep].form_meta
          .sorted_field_meta_sections.length - 1
      setOuterActiveStep(nextOuterActiveStep)
      setInnerActiveStep(innerMaxStep)
    } else {
      setInnerActiveStep(nextInnerActiveStep)
    }
  }

  const handleNextClick = async () => {
    const outerMaxStep = sorted_profile_forms.length - 1
    const innerMaxStep =
      sorted_profile_forms[outerActiveStep].form_meta.sorted_field_meta_sections
        .length - 1
    if (innerActiveStep < innerMaxStep) {
      setInnerActiveStep(innerActiveStep + 1)
    } else {
      // submit form
      const profileForm = sorted_profile_forms[outerActiveStep]
      const formRef = formRefMap.current[profileForm.form_meta.uuid]
      const form = formRef.getForm()
      form.handleSubmit((payload) => handleSubmitForm(profileForm, payload))()

      // update step
      const nextOuterActiveStep = Math.min(outerMaxStep, outerActiveStep + 1)
      setOuterActiveStep(nextOuterActiveStep)
      if (nextOuterActiveStep !== outerActiveStep) {
        setInnerActiveStep(0)
      }

      // handle last form
      if (
        nextOuterActiveStep === outerActiveStep &&
        innerActiveStep === innerMaxStep
      ) {
        await inferProfile()
        router.push('/onboarding/done')
      }
    }
  }

  const handleVisibilityChange = (form_meta, fieldVisibilityMap) => {
    const newFormFieldVisibilityMap = {
      ...formFieldVisibilityMap,
      [form_meta.uuid]: fieldVisibilityMap,
    }
    setFormFieldVisibilityMap(newFormFieldVisibilityMap)
    update_sorted_profile_forms(
      form_metas,
      form_records,
      newFormFieldVisibilityMap
    )
  }

  return (
    <AuthLayout>
      <Stepper activeStep={outerActiveStep}>
        {sorted_profile_forms.map((profile_form) => {
          const { form_meta, form_record } = profile_form
          const field_meta_section =
            form_meta.sorted_field_meta_sections[innerActiveStep]
          const description =
            form_meta.field_meta_section_map[field_meta_section]?.[0]
              ?.description

          return (
            <Stepper.Step key={form_meta.uuid}>
              <h2>{form_meta.form_name}</h2>
              <span>{description}</span>
              <Stepper.StripProgress className="my-3" />
              <Form
                ref={(ref) => {
                  formRefMap.current[form_meta.uuid] = ref
                }}
                formMeta={form_meta}
                formRecord={form_record}
                enumMap={enum_map}
                onVisibilityChange={(fieldVisibilityMap) =>
                  handleVisibilityChange(form_meta, fieldVisibilityMap)
                }
              >
                <Stepper activeStep={innerActiveStep}>
                  {form_meta.sorted_field_meta_sections.map(
                    (field_meta_section) => (
                      <Stepper.Step key={field_meta_section}>
                        <Form.WritableFieldGroup
                          fieldMetas={
                            form_meta.field_meta_section_map[field_meta_section]
                          }
                        />
                        <Stepper.DotProgress className="my-3" />
                      </Stepper.Step>
                    )
                  )}
                </Stepper>
              </Form>
            </Stepper.Step>
          )
        })}
      </Stepper>
      <Stepper.Control className="pb-4">
        <Button
          variant="light"
          disabled={outerActiveStep === 0 && innerActiveStep === 0}
          onClick={handlePrevClick}
        >
          <Icon name="arrow_back" />
          上一步
        </Button>
        <Button variant="dark" onClick={handleNextClick}>
          下一步
          <Icon name="arrow_forward" />
        </Button>
      </Stepper.Control>
    </AuthLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OnboardingPage
