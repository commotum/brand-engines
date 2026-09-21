import React from 'react'
import styled from 'styled-components'
import { Form, Formik } from 'formik'
import { number, object } from 'yup'

import { Modal } from './Modal'
import { Input } from './Input'
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
  error?: string | null
  onClose(): void
  onStart(values: ValueType): void
  className?: string
}

export const TrainModal: React.FC<Props> = ({
  isOpen,
  className,
  onStart,
  isLoading,
  error,
  onClose,
}) => {
  const onSubmit = React.useCallback(
    (values: ValueType) => {
      onStart(values)
    },
    [onStart],
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <Formik
        initialValues={{ ...INIT_VALUES }}
        validationSchema={SCHEMA}
        onSubmit={onSubmit}
      >
        <Form>
          {error && <p role="alert">{error}</p>}
          <SInput
            name="timesteps"
            disabled={isLoading}
            label="Timesteps:"
            placeholder="Please Enter..."
          />
          <SInput
            name="checkpoint"
            disabled={isLoading}
            label="Checkpoint every:"
            placeholder="Please Enter..."
          />
          <ButtonWrap>
            <Button
              data-testid="trainModalSubmit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Starting training…' : 'Start training'}
            </Button>
          </ButtonWrap>
        </Form>
      </Formik>
    </Modal>
  )
}
TrainModal.displayName = 'TrainModal'
