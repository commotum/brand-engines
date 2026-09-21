import React from 'react'
import { useRouter } from 'next/router'

import { getModel, readTrainModel, trainModel } from '../calls'
import { getTrainRoute } from '../constants'
import {
  getTrainingRequest,
  setTrainingRequest,
  TrainingRequest,
  clearTrainingRequest,
} from '../trainingState'

export function useTrain() {
  const router = useRouter()
  const [id, setId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const submitting = React.useRef(false)
  const mounted = React.useRef(true)

  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const onTrainOpen = React.useCallback(
    (id: string) => {
      setId(id)
      setLoading(false)
      setError(null)
    },
    [setId],
  )

  const onClose = React.useCallback(() => {
    if (submitting.current) {
      return
    }
    setId(null)
  }, [setId])

  const onContinue = React.useCallback(
    async ({ timesteps, checkpoint }) => {
      if (submitting.current || !id || getTrainingRequest(id)?.pending) {
        return
      }
      if (!timesteps || !checkpoint) {
        setError('Train data should be defined')
        return
      }
      submitting.current = true
      setLoading(true)
      setError(null)
      let request: TrainingRequest | undefined
      let handedOff = false
      try {
        const baseline = await readTrainModel(id, true)
        if (!baseline) {
          throw new Error('Unable to read the training log. Please retry.')
        }
        if (!mounted.current) {
          return
        }
        const started: TrainingRequest = { baseline, pending: true }
        request = started
        setTrainingRequest(id, request)
        // The endpoint responds at the end of training. Keep its handler alive
        // across navigation, while progress observes metadata and logs.
        trainModel(id, checkpoint, timesteps)
          .catch((cause) => {
            Object.assign(started, {
              error: cause.message || 'Training status unavailable',
              failed: Boolean(cause.trainingFailed),
            })
          })
          .finally(() => {
            started.pending = false
            if (started.abandoned || (!mounted.current && !handedOff)) {
              clearTrainingRequest(id, started)
            }
          })
        // Observe startup instead of guessing how long it takes. The modal
        // keeps its values if the backend rejects the request before startup.
        while (mounted.current) {
          const model = await getModel(id, true).catch(() => null)
          if (request.error) {
            throw new Error(
              request.failed
                ? request.error
                : `Training status unavailable: ${request.error}`,
            )
          }
          if (model?.training || !request.pending) {
            break
          }
          if (!model && mounted.current) {
            setError('Training status unavailable. Waiting for startup…')
          }
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
        if (!mounted.current) {
          return
        }
        handedOff = true
        const opened = await router.push(getTrainRoute(id))
        handedOff = opened
        if (!opened) {
          request.abandoned = true
        }
        if (opened && mounted.current) {
          setId(null)
        }
      } catch (cause) {
        if (request && handedOff) {
          request.abandoned = true
          handedOff = false
        }
        if (request?.error) {
          clearTrainingRequest(id, request)
        }
        if (mounted.current) {
          setError(cause.message || 'Unable to start training. Please retry.')
        }
      } finally {
        if (request && !handedOff && !request.pending) {
          clearTrainingRequest(id, request)
        }
        submitting.current = false
        if (mounted.current) {
          setLoading(false)
        }
      }
    },
    [id, router],
  )

  return {
    isOpen: Boolean(id),
    onTrainOpen,
    onClose,
    onContinue,
    error,
    id: id || '',
    isLoading: Boolean(id && loading),
  }
}
