import React from 'react'

import { renameModel } from '../calls'

export function useRename(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onRename = React.useCallback(
    (id: string) => {
      setId(id)
      setLoading(false)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    setId(null)
  }, [setId])

  const onSubmit = React.useCallback(
    async (newName: string) => {
      if (!id) {
        throw new Error('Rename ID should be defined')
      }
      setLoading(true)
      await renameModel(id, newName)
      await refresh()
      setId(null)
      setLoading(false)
    },
    [setId, id, renameModel, refresh],
  )
  return {
    isOpen: Boolean(id),
    onRename,
    onClose,
    onSubmit,
    id: id || '',
    isLoading: id && loading,
  }
}
