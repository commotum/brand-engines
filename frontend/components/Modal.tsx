import React from 'react'
import styled, { css } from 'styled-components'
import ReactModal from 'react-modal'

export const SReactModal = styled(ReactModal).attrs(({ theme }) => ({
  style: {
    overlay: { backgroundColor: theme.color.blackOpa, zIndex: 9999 },
  },
}))(
  ({ theme }) => css`
    position: fixed;
    top: 50%;
    left: 50%;
    border-radius: ${theme.radius.bigger};
    width: calc(100% - 2rem);
    max-width: 41.5rem;
    height: auto;
    padding: 2.875rem;
    background-color: ${theme.color.white};
    transform: translate(-50%, -50%);

    :focus {
      outline: none;
    }
  `,
)

const Title = styled.h1(
  ({ theme }) => css`
    font-weight: bold;
    color: ${theme.color.black};
    font-size: ${theme.size.normal};
    line-height: 1.2;
    margin: 0;
    margin-bottom: 1rem;
  `,
)

const Line = styled.div(
  ({ theme }) => css`
    width: 100%;
    height: 0.125rem;
    background-color: ${theme.color.gray};
    margin-bottom: 2rem;
  `,
)

type Props = {
  title?: string
  isOpen: boolean
  onClose(): void
  className?: string
}

export const Modal: React.FC<Props> = ({
  isOpen,
  className,
  onClose,
  title,
  children,
}) => {
  return (
    <SReactModal
      onRequestClose={onClose}
      ariaHideApp={!isOpen}
      isOpen={isOpen}
      className={className}
    >
      {title && (
        <>
          <Title data-testid="modalTitle">{title}</Title>
          <Line />
        </>
      )}
      {children}
    </SReactModal>
  )
}
Modal.displayName = 'Modal'
