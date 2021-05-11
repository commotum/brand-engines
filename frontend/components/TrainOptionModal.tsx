import React from 'react'
import styled from 'styled-components'

import { Modal } from './Modal'
import { Throbber } from './Throbber'
import { useModel } from '../utils/hooks/useModel'
import { Button } from './common/Button'

const SModal = styled(Modal)`
  display: flex;
  padding: 5.125rem;
  max-width: 32.875rem;
  justify-content: center;
  align-items: center;
`

const SButton = styled(Button)`
  margin-right: 1rem;
`

type Props = {
  id: string
  isOpen: boolean
  onClose(): void
  isLoading?: boolean
  onContinue(): void
  onTrain(): void
  onNewBranch(): void
  className?: string
}

export const TrainOptionModal: React.FC<Props> = ({
  id,
  isOpen,
  className,
  onNewBranch,
  onTrain,
  onContinue,
  isLoading,
  onClose,
}) => {
  const { data, isLoading: isModelLoading, isError } = useModel(id)
  if (isLoading || isModelLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className={className}>
        <Throbber centered />
      </Modal>
    )
  }
  if (isError || !data) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} className={className}>
        Somethings broken... :(
      </Modal>
    )
  }
  return (
    <SModal isOpen={isOpen} onClose={onClose} className={className}>
      <SButton
        disabled={data.core}
        onClick={data.training ? onTrain : onContinue}
        data-testid="generateModalContinue"
      >
        Continue Training
      </SButton>
      <Button onClick={onNewBranch} data-testid="generateModalNewBranch">
        Create New Branch
      </Button>
    </SModal>
  )
}
TrainOptionModal.displayName = 'TrainOptionModal'
