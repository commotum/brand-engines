import React from 'react'
import { useFormikContext } from 'formik'
import debounce from 'lodash.debounce'

type Props = {
  time: number
}

export const AutoSave: React.FC<Props> = ({ time }) => {
  const [firstSubmit, setFirstSubmit] = React.useState(true)
  const { submitForm, values } = useFormikContext()

  const debouncedSubmit = React.useCallback(debounce(submitForm, time), [
    time,
    submitForm,
  ])

  React.useEffect(() => {
    if (firstSubmit) {
      setFirstSubmit(false)
      return
    }
    debouncedSubmit()
  }, [debouncedSubmit, values])

  return null
}
AutoSave.displayName = 'AutoSave'
