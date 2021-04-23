import React from 'react'
import { useRouter } from 'next/router'

import { forkModel, generateModel, renameModel, trainModel } from '../calls'
import { getTrainRoute } from '../constants'

export function useGenerate(id: string, checkpoint?: string) {
  const [data, setData] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const onGenerate = React.useCallback(
    async ({ temperature, length, top_k, text }) => {
      setLoading(true)
      setData(
        await generateModel(
          id,
          temperature,
          top_k,
          length,
          text,
          checkpoint,
        ).finally(() => {
          setLoading(false)
        }),
      )
    },
    [id, setData, checkpoint],
  )

  return {
    data,
    onGenerate,
    isLoading: Boolean(loading),
  }
}
