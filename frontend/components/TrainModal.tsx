import React from 'react'
import styled from 'styled-components'
import { Form, Formik } from 'formik'
import { number, object } from 'yup'

import { Modal } from './Modal'
import { Input } from './Input'
import { Throbber } from './Throbber'
import { Button } from './common/Button'

const SInput = styled(Input)`
  margin-bottom: 1.25rem;
`

const ButtonWrap = styled.div`
  margin-top: 1.875rem;
  display: flex;
  justify-content: flex-end;
  width: 100%;
`

const SCHEMA = object().shape({
  timesteps: number().required('Timesteps is required'),
  checkpoint: number().required('This field is required'),
})

const INIT_VALUES = {
  timesteps: '',
  checkpoint: '',
}

type ValueType = typeof INIT_VALUES

type Props = {
  isOpen: boolean
  isLoading?: boolean
  onClose(): void
  onStart(values: ValueType): void
  className?: string
}

export const TrainModal: React.FC<Props> = ({
  isOpen,
  className,
  onStart,
  isLoading,
  onClose,
}) => {
  const onSubmit = React.useCallback(
    (values: ValueType) => {
      onStart(values)
    },
    [onStart],
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
          <SInput
            name="timesteps"
            label="Timesteps:"
            placeholder="Please Enter..."
          />
          <SInput
            name="checkpoint"
            label="Checkpoint every:"
            placeholder="Please Enter..."
          />
          <ButtonWrap>
            <Button data-testid="trainModalSubmit" type="submit">
              Start training
            </Button>
          </ButtonWrap>
        </Form>
      </Formik>
    </Modal>
  )
}
TrainModal.displayName = 'TrainModal'
