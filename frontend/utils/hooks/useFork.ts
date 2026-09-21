import React from 'react'

import { forkModel } from '../calls'

export function useFork(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [count, setCount] = React.useState<string | number | undefined>(
    undefined,
  )
  const [loading, setLoading] = React.useState(false)
  const pending = React.useRef(false)
  const [error, setError] = React.useState('')
  const [readyName, setReadyName] = React.useState('')

  const onForkOpen = React.useCallback(
    (id: string, count?: string | number) => {
      if (pending.current) {
        return
      }
      setError('')
      setReadyName('')
      setCount(count)
      setId(id)
      setLoading(false)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    if (!pending.current) {
      setId(null)
    }
  }, [setId])

  const onFork = React.useCallback(
    async ({ name, file }) => {
      if (pending.current) {
        return
      }
      if (!name || !file || !id) {
        throw new Error('Fork data should be defined')
      }
      pending.current = true
      setLoading(true)
      setError('')
      try {
        const result = await forkModel(id, name, file, count)
        if (!result) {
          throw new Error('Could not prepare the model. Please try again.')
        }
        setReadyName(name)
        setId(null)
        await refresh()
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not prepare the model. Please try again.',
        )
      } finally {
        pending.current = false
        setLoading(false)
      }
    },
    [onClose, id, forkModel, setLoading, refresh, count],
  )

  return {
    isOpen: Boolean(id),
    error,
    readyName,
    onForkOpen,
    onClose,
    onFork,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
