import React from 'react'
import styled, { css } from 'styled-components'
import { useRouter } from 'next/router'

import { Checkpoint } from './Checkpoint'
import { useSteps } from '../utils/hooks/useSteps'
import { Throbber } from './Throbber'
import { getGenerateRoute } from '../utils/constants'

const Wrap = styled.div`
  position: relative;
  height: auto;
`

const InnerWrap = styled.div`
  position: relative;
  overflow: hidden;
  margin-left: 3.75rem;
  height: auto;
`

const Chevron = styled.img.attrs(({ theme }) => ({
  src: theme.images.chevronRight,
}))<{ selected?: number }>(
  ({ selected }) => css`
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.25rem;
    transition: 200ms transform;
    transform: rotate(${selected ? `90deg` : 0});
  `,
)

const Folder = styled.img.attrs(({ theme }) => ({
  src: theme.images.folderClosed,
}))(
  () => css`
    position: relative;
    top: -0.0625rem;
    width: 1.75rem;
    height: auto;
    margin-right: 0.75rem;
  `,
)

const TitleButton = styled.button(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    border-radius: ${theme.radius.default};
    background-color: transparent;
    border: 0.125rem solid transparent;
    box-shadow: none;
    cursor: pointer;
    padding: 0.125rem 0.375rem;
    color: ${theme.color.black};
    font-weight: 600;
    font-size: ${theme.size.default};

    :focus,
    :active {
      border-color: ${theme.color.black};
      outline: none;
    }

    :disabled {
      opacity: 0.3;
      cursor: default;
      :active {
        border-color: transparent;
        outline: none;
      }
    }
  `,
)

type Props = {
  title: string
  loading?: boolean
  checkpoints: { id: string; title: string; samples: string[] }[]
  onGenerate(id: string): void
  onFork(id: string): void
  className?: string
}

export const Model: React.FC<Props> = ({
  className,
  loading,
  title,
  onFork,
  onGenerate,
  checkpoints,
}) => {
  const [selected, setSelected] = React.useState(false)
  return (
    <Wrap className={className} data-testid="model">
      <TitleButton
        disabled={checkpoints.length <= 0}
        data-testid="modelTitle"
        onClick={() => {
          setSelected((prev) => !prev)
        }}
      >
        <Chevron selected={Number(selected)} />
        <Folder />
        {loading ? <Throbber /> : title}
      </TitleButton>
      <InnerWrap>
        {checkpoints.map(({ id, title, samples }) => (
          <Checkpoint
            key={title}
            onGenerate={() => {
              onGenerate(id)
            }}
            onFork={() => {
              onFork(id)
            }}
            disabled={!selected}
            title={title}
            samples={samples}
          />
        ))}
      </InnerWrap>
    </Wrap>
  )
}

type SmartProps = {
  id: string
  amount: number
  onFork(id: string, count: string): void
  title: string
}

export const SmartModel: React.FC<SmartProps> = ({
  id,
  amount,
  onFork,
  title,
}) => {
  const router = useRouter()
  const { data = [], isLoading } = useSteps(id, amount)
  const onGenerate = React.useCallback(
    async (count: string) => {
      await router.push(getGenerateRoute(id, count))
    },
    [router, id],
  )

  const onForkClick = React.useCallback(
    (count: string) => {
      console.log(id, count)
      onFork(id, count)
    },
    [id],
  )
  return (
    <Model
      title={title}
      loading={isLoading}
      onGenerate={onGenerate}
      onFork={onForkClick}
      checkpoints={Object.entries(data || {}).map(
        ([count, { data: samples, loss, avg_loss }]) => ({
          id: count,
          title: `Checkpoint-${count} (loss: ${loss}, avg: ${avg_loss})`,
          samples: samples,
        }),
      )}
    />
  )
}

Model.displayName = 'Model'
