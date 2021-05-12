import React from 'react'
import styled, { css } from 'styled-components'
import { useRouter } from 'next/router'

import { Sample } from './Sample'
import { getGenerateRoute } from '../utils/constants'

const Wrap = styled.div`
  height: auto;
  position: relative;
`

const InnerWrap = styled.div`
  overflow: hidden;
  position: relative;
  margin-left: 3.75rem;
  height: min-content;
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

const CheckpointIcon = styled.img.attrs(({ theme }) => ({
  src: theme.images.checkpoint,
}))(
  () => css`
    width: 1.5rem;
    height: auto;
    margin-right: 0.75rem;
  `,
)

const GenerateIcon = styled.img.attrs(({ theme }) => ({
  src: theme.images.generate,
}))(
  () => css`
    width: 1.5rem;
    height: auto;
    margin-right: 0.75rem;
  `,
)

const BranchIcon = styled.img.attrs(({ theme }) => ({
  src: theme.images.branch,
}))(
  () => css`
    width: 1.5rem;
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
    color: ${theme.color.medium};
    font-weight: 500;
    font-size: ${theme.size.default};
    height: 1.875rem;
    transition: 300ms height ease-out;

    :focus,
    :active {
      border-color: ${theme.color.black};
      outline: none;
    }

    :disabled {
      padding-top: 0;
      padding-bottom: 0;
      margin: 0 0.125rem;
      height: 0;
      border: none;
    }
  `,
)

type Props = {
  title: string
  samples: string[]
  disabled?: boolean
  className?: string
  onGenerate(): void
  onFork(): void
}

export const Checkpoint: React.FC<Props> = ({
  samples,
  disabled = false,
  className,
  onGenerate,
  onFork,
  title,
}) => {
  const router = useRouter()
  const [selected, setSelected] = React.useState(false)
  React.useEffect(() => {
    setSelected(false)
  }, [disabled])
  return (
    <Wrap className={className} data-testid="checkpoint">
      <TitleButton
        disabled={disabled}
        data-testid="checkpointTitle"
        onClick={() => {
          setSelected((prev) => !prev)
        }}
      >
        <Chevron selected={Number(selected)} />
        <CheckpointIcon />
        {title}
      </TitleButton>
      <InnerWrap>
        <TitleButton
          onClick={onGenerate}
          data-testid="checkpointGenerate"
          disabled={disabled || !selected}
        >
          <GenerateIcon />
          Generate from Checkpoint
        </TitleButton>
        <TitleButton
          onClick={onFork}
          data-testid="checkpointBranch"
          disabled={disabled || !selected}
        >
          <BranchIcon />
          New Branch from Checkpoint
        </TitleButton>
        <Sample
          title={'View Samples from Checkpoint'}
          samples={samples}
          disabled={disabled || !selected}
        />
      </InnerWrap>
    </Wrap>
  )
}

Checkpoint.displayName = 'Checkpoint'
