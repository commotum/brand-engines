import React from 'react'
import styled from 'styled-components'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'

import { Modal } from './Modal'
import { Input } from './Input'
import { FileInput } from './FileInput'
import { Button } from './common/Button'

const SInput = styled(Input)`
  margin-top: 1.5rem;
  margin-bottom: 1.25rem;
`

const ButtonWrap = styled.div`
  margin-top: 1.875rem;
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

const SCHEMA = object().shape({
  file: string().required('File is required'),
  name: string().required('Name is required'),
})

const INIT_VALUES = {
  file: '',
  name: '',
}

type ValueType = typeof INIT_VALUES

type Props = {
  isOpen: boolean
  isLoading?: boolean
  onClose(): void
  onContinue(values: ValueType): void
  className?: string
  error?: string
}

export const ForkModal: React.FC<Props> = ({
  isOpen,
  className,
  onContinue,
  isLoading,
  onClose,
  error,
}) => {
  const onSubmit = React.useCallback(
    (values: ValueType) => {
      if (!isLoading) {
        return onContinue(values)
      }
    },
    [onContinue, isLoading],
  )
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <Formik
        initialValues={{ ...INIT_VALUES }}
        validationSchema={SCHEMA}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <Form
            onSubmitCapture={(event) => {
              if (isLoading) {
                event.preventDefault()
                event.stopPropagation()
              }
            }}
          >
            <fieldset
              disabled={isLoading}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              <FileInput label="Select Training Data" name="file" />
              <SInput
                name="name"
                label="New Model Name:"
                placeholder="Please Enter..."
              />
            </fieldset>
            {isLoading && (
              <p role="status">
                Preparing {values.name} with the selected training data…
              </p>
            )}
            {error && <p role="alert">{error}</p>}
            <ButtonWrap>
              <Button
                data-testid="uploadModalSubmit"
                type="submit"
                disabled={isLoading || !values.file}
              >
                {isLoading ? 'Preparing…' : 'Continue'}
              </Button>
            </ButtonWrap>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}
ForkModal.displayName = 'ForkModal'
