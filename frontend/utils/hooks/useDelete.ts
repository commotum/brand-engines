import React from 'react'

import { deleteModel } from '../calls'

export function useDelete(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const pending = React.useRef(false)
  const [error, setError] = React.useState('')

  const onDelete = React.useCallback(
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

  const onDeleteConfirm = React.useCallback(async () => {
    if (pending.current) {
      return
    }
    if (!id) {
      throw new Error('Delete ID should be defined')
    }
    pending.current = true
    setLoading(true)
    setError('')
    try {
      const result = await deleteModel(id)
      if (!result) {
        throw new Error('Could not delete the model. Please try again.')
      }
      setId(null)
      await refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Could not delete the model. Please try again.',
      )
    } finally {
      pending.current = false
      setLoading(false)
    }
  }, [id, refresh])

  return {
    isOpen: Boolean(id),
    error,
    onDelete,
    onDeleteConfirm,
    onClose,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
