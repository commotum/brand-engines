import React from 'react'

import { getModel, readTrainModel } from '../calls'
import { useInterval } from './useInterval'

const RELOAD_TIME = 5000

export function useTrainOutput(id: string) {
  const [finito, setFinito] = React.useState<boolean>(false)
  const [output, setOutput] = React.useState<string[] | null>()
  const getOutput = React.useCallback(async () => {
    if (!id) {
      throw new Error('Id should be defined')
    }
    const model = await getModel(id)
    if (!model) {
      throw new Error('Model not found')
      return
    }
    if (!model.training) {
      setFinito(true)
      return
    }
    setOutput(await readTrainModel(id))
  }, [setOutput, id])

  useInterval(
    RELOAD_TIME,
    () => {
      if (finito) {
        return
      }

      getOutput()
    },
    [finito, getOutput],
  )

  return {
    data: output,
    finito,
    isLoading: !output && output !== null,
    isError: output === null,
  }
}
