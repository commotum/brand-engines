import React from 'react'
import styled, { css } from 'styled-components'

const Wrap = styled.div<{ centered: number }>(
  ({ theme, centered }) => css`
    display: inline-block;
    position: relative;
    width: 3.75rem;
    height: 3.75rem;

    div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 2.75rem;
      height: 2.75rem;
      margin: 0.5rem;
      border: 0.25rem solid ${theme.color.black};
      border-radius: 50%;
      animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: ${theme.color.black} transparent transparent transparent;

      :nth-child(1) {
        animation-delay: -0.45s;
      }
      :nth-child(2) {
        animation-delay: -0.3s;
      }
      :nth-child(3) {
        animation-delay: -0.15s;
      }
    }
    @keyframes lds-ring {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    ${centered &&
    css`
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `};
  `,
)

type Props = {
  centered?: boolean
  className?: string
}

export const Throbber: React.FC<Props> = ({ centered, className }) => {
  return (
    <Wrap
      centered={Number(centered)}
      className={className}
      data-testid="throbber"
    >
      <div />
      <div />
      <div />
      <div />
    </Wrap>
  )
}

Throbber.displayName = 'Throbber'
