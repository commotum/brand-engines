import { NextPage } from 'next'
import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import { getModelDisplayName } from '../utils/constants'
import { TopPanel } from '../components/TopPanel'
import { LoadingText } from '../components/LoadingText'
import { useTrainOutput } from '../utils/hooks/useTrainOutput'

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const STopPanel = styled(TopPanel)`
  max-width: 85rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
`

const InnerWrap = styled.div`
  position: absolute;
  top: 8rem;
  width: 100%;
  height: calc(100% - 8rem);
`

type Props = {}

const Train: NextPage<Props> = () => {
  const {
    query: { id },
  } = useRouter()
  const modelId = typeof id === 'string' ? id : ''
  const {
    data,
    status,
    active,
    pending,
    isLoading,
    error,
    retry,
  } = useTrainOutput(modelId)

  return (
    <Wrap>
      <STopPanel title={`${getModelDisplayName(modelId)} - Training`} />
      <InnerWrap>
        <LoadingText
          text={data}
          status={status}
          active={active}
          loading={isLoading || pending}
          error={error}
          onRetry={retry}
        />
      </InnerWrap>
    </Wrap>
  )
}

Train.displayName = 'Train'

export default Train
