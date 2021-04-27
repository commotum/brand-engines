import React from 'react'
import styled from 'styled-components'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'

import { Modal } from './Modal'
import { Input } from './Input'
import { FileInput } from './FileInput'
import { Throbber } from './Throbber'
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
}

export const ForkModal: React.FC<Props> = ({
  isOpen,
  className,
  onContinue,
  isLoading,
  onClose,
}) => {
  const onSubmit = React.useCallback(
    (values: ValueType) => {
      onContinue(values)
    },
    [onContinue],
  )

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className={className}>
        <Throbber centered />
      </Modal>
    )
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <Formik
        initialValues={{ ...INIT_VALUES }}
        validationSchema={SCHEMA}
        onSubmit={onSubmit}
      >
        <Form>
          <FileInput label="Select Training Data" name="file" />
          <SInput
            name="name"
            label="New Model Name:"
            placeholder="Please Enter..."
          />
          <ButtonWrap>
            <Button data-testid="uploadModalSubmit" type="submit">
              Continue
            </Button>
          </ButtonWrap>
        </Form>
      </Formik>
    </Modal>
  )
}
ForkModal.displayName = 'ForkModal'
