import React from 'react'
import styled, { css } from 'styled-components'

import { Modal } from './Modal'
import { ModalButtons } from './ModalButtons'

const Text = styled.h3(
  ({ theme }) => css`
    font-weight: bold;
    color: ${theme.color.black};
    font-size: ${theme.size.default};
  `,
)

type Props = {
  isOpen: boolean
  onClose(): void
  onDelete(): void
  className?: string
  isLoading?: boolean
  error?: string
}

export const DeleteModal: React.FC<Props> = ({
  isOpen,
  className,
  onClose,
  onDelete,
  isLoading,
  error,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete"
      className={className}
    >
      <Text>Are you sure you want to delete?</Text>
      {error && <p role="alert">{error}</p>}
      <ModalButtons
        cancel={{ text: 'Cancel', fn: onClose, disabled: isLoading }}
        confirm={{
          text: isLoading ? 'Deleting…' : 'Delete',
          fn: onDelete,
          disabled: isLoading,
        }}
      />
    </Modal>
  )
}
DeleteModal.displayName = 'DeleteModal'
