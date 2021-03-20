import React from 'react'
import styled from 'styled-components'

import { Button, SecButton } from './common/Button'

const Wrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 5rem;
`

const SSecButton = styled(SecButton)`
  margin-right: 1rem;
`

type Props = {
  confirm?: { text: string; fn: () => void }
  cancel?: { text: string; fn: () => void }
  className?: string
}

export const ModalButtons: React.FC<Props> = ({
  confirm,
  cancel,
  className,
}) => {
  const onCancel = React.useCallback(
    (ev: React.MouseEvent) => {
      ev.preventDefault()
      if (!cancel) {
        return
      }
      cancel.fn()
    },
    [cancel],
  )
  return (
    <Wrap data-testid="modalButtons" className={className}>
      {cancel && (
        <SSecButton
          type="button"
          data-testid="modalButtonsCancel"
          onClick={onCancel}
        >
          {cancel.text}
        </SSecButton>
      )}
      {confirm && (
        <Button
          type="submit"
          data-testid="modalButtonsConfirm"
          onClick={confirm.fn}
        >
          {confirm.text}
        </Button>
      )}
    </Wrap>
  )
}
ModalButtons.displayName = 'ModalButtons'
