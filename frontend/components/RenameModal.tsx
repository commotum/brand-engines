import React from 'react'
import styled, { css } from 'styled-components'
import { Form, Formik } from 'formik'
import { object, string } from 'yup'

import { Modal } from './Modal'
import { Input } from './Input'
import { ModalButtons } from './ModalButtons'

const SLabel = styled.label(
  ({ theme }) => css`
    margin-bottom: 2.5rem;
    position: relative;
    display: block;
    width: max-content;
    color: ${theme.color.medium};
    font-size: ${theme.size.default};
    font-weight: 600;
  `,
)

const Text = styled.h3(
  ({ theme }) => css`
    margin-top: 0.875rem;
    font-weight: 600;
    color: ${theme.color.black};
    font-size: ${theme.size.normal};
  `,
)

const SModalButtons = styled(ModalButtons)`
  margin-top: 2.875rem;
`

const SCHEMA = object().shape({
  newName: string().required('New name is required'),
})

const INIT_VALUES = {
  newName: '',
}

type Props = {
  isOpen: boolean
  currentName: string
  onClose(): void
  onSubmit(newName: string): void
  className?: string
}

export const RenameModal: React.FC<Props> = ({
  isOpen,
  className,
  onClose,
  currentName,
  onSubmit,
}) => {
  const onFormSubmit = React.useCallback(
    ({ newName }: typeof INIT_VALUES) => {
      onSubmit(newName)
    },
    [onSubmit],
  )
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename"
      className={className}
    >
      <Formik
        initialValues={{ ...INIT_VALUES }}
        validationSchema={SCHEMA}
        onSubmit={onFormSubmit}
      >
        <Form>
          <SLabel>
            Current name:
            <Text data-testid="renameModalName">{currentName}</Text>
          </SLabel>
          <Input
            name="newName"
            label="New Name:"
            placeholder="Please Enter..."
          />
          <SModalButtons
            confirm={{ text: 'Submit', fn: () => {} }}
            cancel={{ text: 'Cancel', fn: onClose }}
          />
        </Form>
      </Formik>
    </Modal>
  )
}
RenameModal.displayName = 'RenameModal'
