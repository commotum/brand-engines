import React from 'react'

export function useTrainOption(refresh: () => void) {
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onTrain = React.useCallback(
    (id: string) => {
      setId(id)
      setLoading(false)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    setId(null)
  }, [setId])

  return {
    isOpen: Boolean(id),
    onTrain,
    onClose,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
