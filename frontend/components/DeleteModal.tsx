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
}

export const DeleteModal: React.FC<Props> = ({
  isOpen,
  className,
  onClose,
  onDelete,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete"
      className={className}
    >
      <Text>Are you sure you want to delete?</Text>
      <ModalButtons
        cancel={{ text: 'Cancel', fn: onClose }}
        confirm={{ text: 'Delete', fn: onDelete }}
      />
    </Modal>
  )
}
DeleteModal.displayName = 'DeleteModal'
