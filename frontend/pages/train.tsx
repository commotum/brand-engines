import { NextPage } from 'next'
import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import { TopPanel } from '../components/TopPanel'
import { LoadingText } from '../components/LoadingText'
import { useTrainOutput } from '../utils/hooks/useTrainOutput'
import { Finito } from '../components/Finito'
import { Throbber } from '../components/Throbber'

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

const SFinito = styled(Finito)`
  top: 50%;
  left: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
`

type Props = {}

const Train: NextPage<Props> = () => {
  const {
    query: { id },
  } = useRouter()
  const { data, isLoading, finito } = useTrainOutput(id as string)

  if (finito) {
    return (
      <Wrap>
        <STopPanel title={`${id} - Training`} />
        <InnerWrap>
          <SFinito />
        </InnerWrap>
      </Wrap>
    )
  }

  if (isLoading) {
    return (
      <Wrap>
        <STopPanel title={`${id} - Training`} />
        <InnerWrap>
          <Throbber centered />
        </InnerWrap>
      </Wrap>
    )
  }

  return (
    <Wrap>
      <STopPanel title={`${id} - Training`} />
      <InnerWrap>
        <LoadingText text={data || []} />
      </InnerWrap>
    </Wrap>
  )
}

Train.displayName = 'Train'

export default Train
