import React from 'react'

import { getModel, readTrainModel } from '../calls'
import { parseTrainingLog } from '../trainingLog'
import { clearTrainingRequest, getTrainingRequest } from '../trainingState'

const RELOAD_TIME = 2000

export function useTrainOutput(id: string) {
  const [output, setOutput] = React.useState<string[]>([])
  const [status, setStatus] = React.useState('Reading training status…')
  const [loading, setLoading] = React.useState(true)
  const [active, setActive] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [refresh, setRefresh] = React.useState(0)

  React.useEffect(() => setOutput([]), [id])

  React.useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    let observedActive = false
    const startingRequest = getTrainingRequest(id)
    if (startingRequest) {
      startingRequest.abandoned = false
    }
    setLoading(true)
    setError(null)
    setActive(false)
    setStatus(
      getTrainingRequest(id)?.pending
        ? 'Starting training…'
        : 'Reading training status…',
    )
    if (!id) {
      return
    }

    const poll = async () => {
      let again = true
      try {
        const model = await getModel(id, true)
        if (cancelled) {
          return
        }
        if (!model) {
          throw new Error('Unable to read model status')
        }
        // Always read the snapshot, including the poll where training turns off.
        const snapshot = await readTrainModel(id, true)
        if (cancelled) {
          return
        }
        if (!snapshot) {
          throw new Error('Unable to read the training log')
        }
        const request = getTrainingRequest(id)
        if (
          request &&
          JSON.stringify(snapshot) !== JSON.stringify(request.baseline)
        ) {
          request.fresh = true
        }
        const available = !request || request.fresh ? snapshot : []
        const log = parseTrainingLog(available)
        setOutput(available)
        setError(request?.error || null)
        setLoading(false)
        setActive(Boolean(model.training))
        if (request?.failed) {
          setStatus(
            model.training ? 'Training request failed' : 'Training failed',
          )
          again = request.pending
        } else if (model.training) {
          observedActive = true
          setStatus(
            log.outcome === 'failed'
              ? 'Training failed'
              : log.outcome === 'interrupted'
              ? 'Training interrupted'
              : log.status,
          )
        } else if (log.outcome) {
          setStatus(
            {
              completed: 'Training completed',
              failed: 'Training failed',
              interrupted: 'Training interrupted',
            }[log.outcome],
          )
          again = Boolean(request?.pending)
        } else if (request?.pending && !observedActive) {
          setStatus('Starting training…')
        } else if (request?.error) {
          setStatus('Training status unavailable')
          again = false
        } else {
          setStatus(
            observedActive || request
              ? 'Outcome unavailable'
              : 'Training is not active',
          )
          // Wait for the request's eventual response too, so late errors surface.
          again = Boolean(request?.pending)
        }
        if (request && !request.pending && !again) {
          clearTrainingRequest(id, request)
        }
      } catch (cause) {
        if (cancelled) {
          return
        }
        setLoading(false)
        setActive(false)
        setError(
          `${
            cause.message || 'Connection failed'
          }. Status is unavailable; retrying…`,
        )
        setStatus('Training status unavailable')
      }
      if (!cancelled && again) {
        timer = setTimeout(poll, RELOAD_TIME)
      }
    }
    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
      if (startingRequest) {
        startingRequest.abandoned = true
        if (!startingRequest.pending) {
          clearTrainingRequest(id, startingRequest)
        }
      }
    }
  }, [id, refresh])

  return {
    data: output,
    status,
    active,
    pending: Boolean(getTrainingRequest(id)?.pending),
    error,
    isLoading: loading,
    isError: Boolean(error),
    retry: () => setRefresh((value) => value + 1),
  }
}
