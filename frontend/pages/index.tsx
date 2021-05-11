import { NextPage } from 'next'
import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import { TopPanel } from '../components/TopPanel'
import { useModels } from '../utils/hooks/useModels'
import { Throbber } from '../components/Throbber'
import { ItemGrid } from '../components/ItemGrid'
import { TrainOptionModal } from '../components/TrainOptionModal'
import { useTrainOption } from '../utils/hooks/useTrainOption'
import { ForkModal } from '../components/ForkModal'
import { useFork } from '../utils/hooks/useFork'
import { useTrain } from '../utils/hooks/useTrain'
import { TrainModal } from '../components/TrainModal'
import {
  getGenerateRoute,
  getHistoryRoute,
  getTrainRoute,
} from '../utils/constants'
import { SortKey } from '../@types/types'

const Wrap = styled.div`
  width: 100%;
  position: relative;
  max-width: 85rem;
  margin: 0 auto;
  padding: 0 1rem;
`

type Props = {}

const Index: NextPage<Props> = () => {
  const router = useRouter()
  const [search, onSearch] = React.useState('')
  const [sort, onSort] = React.useState<SortKey>('name')
  const { data, isLoading, isError, refresh } = useModels(search, sort)
  const {
    id: trainId,
    onClose: onTrainOptionClose,
    isOpen: isTrainOptionOpen,
    isLoading: isTrainOptionLoading,
    onTrain,
  } = useTrainOption(refresh)
  const {
    onClose: onForkClose,
    isOpen: isForkOpen,
    isLoading: isForkLoading,
    onFork,
    onForkOpen,
  } = useFork(refresh)
  const {
    onClose: onTrainClose,
    isOpen: isTrainOpen,
    isLoading: isTrainLoading,
    onTrainOpen,
    onContinue: onTrainContinue,
  } = useTrain()

  const onForkModal = React.useCallback(() => {
    onForkOpen(trainId)
    onTrainOptionClose()
  }, [trainId, onTrainOptionClose, onForkOpen])

  const routeToTrain = React.useCallback(async () => {
    await router.push(getTrainRoute(trainId))
    onTrainOptionClose()
    return
  }, [trainId, onTrainOptionClose, onTrainOpen])

  const onTrainModal = React.useCallback(async () => {
    onTrainOpen(trainId)
    onTrainOptionClose()
  }, [trainId, onTrainOptionClose, onTrainOpen])

  const onGenerate = React.useCallback(
    async (id: string) => {
      await router.push(getGenerateRoute(id))
    },
    [router],
  )


  if (isLoading) {
    return (
      <Wrap>
        <TopPanel />
        <Throbber centered />
      </Wrap>
    )
  }
  if (isError || !data) {
    return (
      <Wrap>
        <TopPanel />
        Ups, Something is broken
      </Wrap>
    )
  }
  return (
    <Wrap>
      <TopPanel onSearch={onSearch} onSort={onSort} />
      <ItemGrid
        onTrain={onTrain}
        onGenerate={onGenerate}
        items={data}
      />
      <TrainOptionModal
        id={trainId}
        onTrain={routeToTrain}
        onClose={onTrainOptionClose}
        onContinue={onTrainModal}
        onNewBranch={onForkModal}
        isLoading={isTrainOptionLoading}
        isOpen={isTrainOptionOpen}
      />
      <TrainModal
        onClose={onTrainClose}
        onStart={onTrainContinue}
        isLoading={isTrainLoading}
        isOpen={isTrainOpen}
      />
      <ForkModal
        onClose={onForkClose}
        onContinue={onFork}
        isLoading={isForkLoading}
        isOpen={isForkOpen}
      />
    </Wrap>
  )
}
Index.displayName = 'Index'

export default Index
