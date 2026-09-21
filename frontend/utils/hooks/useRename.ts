import React from 'react'

import { renameModel } from '../calls'

export function useRename(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const pending = React.useRef(false)
  const [error, setError] = React.useState('')

  const onRename = React.useCallback(
    (id: string) => {
      if (pending.current) {
        return
      }
      setError('')
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

  const onSubmit = React.useCallback(
    async (newName: string) => {
      if (pending.current) {
        return
      }
      if (!id) {
        throw new Error('Rename ID should be defined')
      }
      pending.current = true
      setLoading(true)
      setError('')
      try {
        const result = await renameModel(id, newName)
        if (!result) {
          throw new Error('Could not rename the model. Please try again.')
        }
        setId(null)
        await refresh()
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Could not rename the model. Please try again.',
        )
      } finally {
        pending.current = false
        setLoading(false)
      }
    },
    [setId, id, renameModel, refresh],
  )
  return {
    isOpen: Boolean(id),
    error,
    onRename,
    onClose,
    onSubmit,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
