import { NextPage } from 'next'
import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import { TopPanel } from '../components/TopPanel'
import { useModels } from '../utils/hooks/useModels'
import { Throbber } from '../components/Throbber'
import { ItemGrid } from '../components/ItemGrid'
import { RenameModal } from '../components/RenameModal'
import { useRename } from '../utils/hooks/useRename'
import { TrainOptionModal } from '../components/TrainOptionModal'
import { useTrainOption } from '../utils/hooks/useTrainOption'
import { useDelete } from '../utils/hooks/useDelete'
import { DeleteModal } from '../components/DeleteModal'
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
    id: renameId,
    onClose: onRenameClose,
    isOpen: isRenameOpen,
    onRename,
    onSubmit: onRenameSubmit,
  } = useRename(refresh)
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
  const {
    onClose: onDeleteClose,
    isOpen: isDeleteOpen,
    onDeleteConfirm,
    onDelete,
  } = useDelete(refresh)

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

  const onHistory = React.useCallback(
    async (id: string) => {
      await router.push(getHistoryRoute(id))
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
        onRename={onRename}
        onTrain={onTrain}
        onDelete={onDelete}
        onGenerate={onGenerate}
        onHistory={onHistory}
        items={data}
      />
      <RenameModal
        onClose={onRenameClose}
        onSubmit={onRenameSubmit}
        currentName={renameId}
        isOpen={isRenameOpen}
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
      <DeleteModal
        onClose={onDeleteClose}
        onDelete={onDeleteConfirm}
        isOpen={isDeleteOpen}
      />
    </Wrap>
  )
}
Index.displayName = 'Index'

export default Index
