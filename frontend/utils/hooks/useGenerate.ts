import React from 'react'

import { generateModel } from '../calls'

export function useGenerate(id: string, checkpoint?: string) {
  const [data, setData] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const submitting = React.useRef(false)

  const onGenerate = React.useCallback(
    async ({ temperature, length, topK, text }) => {
      if (submitting.current) {
        return
      }
      submitting.current = true
      setLoading(true)
      setError(null)
      try {
        const result = await generateModel(
          id,
          temperature,
          topK,
          length,
          text,
          checkpoint,
        )
        if (result === null) {
          throw new Error('Could not generate text. Please retry.')
        }
        setData(result)
      } catch (cause) {
        setError(cause.message || 'Could not generate text. Please retry.')
      } finally {
        submitting.current = false
        setLoading(false)
      }
    },
    [id, setData, checkpoint],
  )

  return {
    data,
    error,
    onGenerate,
    isLoading: Boolean(loading),
  }
}
