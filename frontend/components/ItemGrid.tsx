import React from 'react'
import styled, { css } from 'styled-components'

import { Item } from './Item'
import { Model } from '../@types/types'

const Wrap = styled.div(
  ({ theme }) => css`
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 2rem;
    row-gap: 2rem;

    @media only screen and (max-width: ${theme.screenWidth.screen}) {
      grid-template-columns: 1fr 1fr;
    }

    @media only screen and (max-width: ${theme.screenWidth.tablet}) {
      grid-template-columns: 1fr;
    }
  `,
)

type Props = {
  items: Model[]
  className?: string
  onTrain?(name: string): void
  onGenerate?(name: string): void
  onRename?(name: string): void
  onDelete?(name: string): void
  onHistory?(name: string): void
}

export const ItemGrid: React.FC<Props> = ({
  items,
  onRename,
  onHistory,
  onGenerate,
  className,
  onDelete,
  onTrain,
}) => {
  const onCallback = React.useCallback(
    (fn: ((name: string) => void) | undefined, name: string) => {
      if (!fn) {
        return undefined
      }
      return () => {
        fn(name)
      }
    },
    [],
  )

  return (
    <Wrap className={className} data-testid="itemGrid">
      {items.map(({ name, core }) => (
        <Item
          key={name}
          onTrain={onCallback(onTrain, name)}
          onGenerate={onCallback(onGenerate, name)}
          onRename={core ? undefined : onCallback(onRename, name)}
          onDelete={core ? undefined : onCallback(onDelete, name)}
          onHistory={core ? undefined : onCallback(onHistory, name)}
          title={name}
        />
      ))}
    </Wrap>
  )
}
ItemGrid.displayName = 'ItemGrid'
