import React from 'react'
import { useRouter } from 'next/router'

import { forkModel, renameModel, trainModel } from '../calls'
import { getTrainRoute } from '../constants'

export function useTrain() {
  const router = useRouter()
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onTrainOpen = React.useCallback(
    (id: string) => {
      setId(id)
      setLoading(false)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    setId(null)
  }, [setId])

  const onContinue = React.useCallback(
    async ({ timesteps, checkpoint }) => {
      if (!id || !timesteps || !checkpoint) {
        throw new Error('Train data should be defined')
      }
      setLoading(true)
      trainModel(id, checkpoint, timesteps)
      await new Promise((res) => setTimeout(() => res(null), 2000))
      await router.push(getTrainRoute(id))
      onClose()
    },
    [onClose, id],
  )

  return {
    isOpen: Boolean(id),
    onTrainOpen,
    onClose,
    onContinue,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
