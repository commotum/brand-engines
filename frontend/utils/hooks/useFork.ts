import React from 'react'

import { forkModel } from '../calls'

export function useFork(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [count, setCount] = React.useState<string | number | undefined>(
    undefined,
  )
  const [loading, setLoading] = React.useState(false)

  const onForkOpen = React.useCallback(
    (id: string, count?: string | number) => {
      setCount(count)
      setId(id)
      setLoading(false)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    setId(null)
  }, [setId])

  const onFork = React.useCallback(
    async ({ name, file }) => {
      if (!name || !file || !id) {
        throw new Error('Fork data should be defined')
      }
      setLoading(true)
      await forkModel(id, name, file, count)
      await refresh()
      setLoading(false)
      onClose()
    },
    [onClose, id, forkModel, setLoading, refresh, count],
  )

  return {
    isOpen: Boolean(id),
    onForkOpen,
    onClose,
    onFork,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
