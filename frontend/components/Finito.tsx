import React from 'react'
import styled, { css } from 'styled-components'

const Wrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`

const Check = styled.img.attrs(({ theme }) => ({
  src: theme.images.checkCircle,
}))(
  () => css`
    width: 2.875rem;
    height: 2.875rem;
    margin-bottom: 1.25rem;
  `,
)

const Title = styled.h1(
  ({ theme }) => css`
    color: ${theme.color.black};
    margin: 0;
    font-weight: bold;
    font-size: ${theme.size.defaulish};
  `,
)

type Props = {
  className?: string
}

export const Finito: React.FC<Props> = ({ className }) => {
  return (
    <Wrap className={className} data-testid="finito">
      <Check />
      <Title data-testid="finitoTitle">Training completed</Title>
    </Wrap>
  )
}

Finito.displayName = 'Finito'
