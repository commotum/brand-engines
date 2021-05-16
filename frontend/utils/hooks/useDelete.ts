import React from 'react'

import { deleteModel, forkModel, renameModel } from '../calls'

export function useDelete(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onDelete = React.useCallback(
    (id: string) => {
      setId(id)
      setLoading(false)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    setId(null)
  }, [setId])

  const onDeleteConfirm = React.useCallback(async () => {
    if (!id) {
      throw new Error('Train ID should be defined')
    }
    setLoading(true)
    await deleteModel(id)
    await refresh()
    setLoading(false)
    onClose()
  }, [onClose, id, forkModel, setLoading, refresh])

  return {
    isOpen: Boolean(id),
    onDelete,
    onDeleteConfirm,
    onClose,
    id: id || '',
    isLoading: id && loading,
  }
}
