import React from 'react'
import styled, { css } from 'styled-components'

import { Throbber } from './Throbber'

const Wrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  position: relative;
`

const Title = styled.h1(
  ({ theme }) => css`
    margin: 1.25rem 0 0;
    color: ${theme.color.black};
    font-weight: bold;
    font-size: ${theme.size.defaulish};
  `,
)

const ArrowImg = styled.img.attrs<{ disabled: boolean }>(
  ({ disabled, theme }) => ({
    src: disabled ? theme.images.arrowDownGray : theme.images.arrowDown,
  }),
)<{ disabled: boolean }>(
  () => css`
    width: 100%;
    height: auto;
  `,
)

const ScrollButton = styled.button(
  ({ theme }) => css`
    width: 2.25rem;
    height: 2.25rem;
    position: absolute;
    top: 0.75rem;
    cursor: pointer;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: none;
    border: 0.125rem solid transparent;
    border-radius: 50%;
    padding: 0;
    background: transparent;

    :focus,
    :active {
      border-color: ${theme.color.black};
      outline: none;
    }
  `,
)

type Props = {
  onClick?(): void
  enabled?: boolean
  title: string
  className?: string
}

export const Loading: React.FC<Props> = ({
  onClick,
  enabled,
  className,
  title,
}) => {
  return (
    <Wrap className={className} data-testid="loading">
      <Throbber />
      <Title data-testid="loadingTitle">{title}</Title>
      {!enabled && (
        <ScrollButton onClick={onClick}>
          <ArrowImg disabled={!enabled} />
        </ScrollButton>
      )}
    </Wrap>
  )
}

Loading.displayName = 'Loading'
