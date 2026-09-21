// Keep the synchronous request's result available when the start modal unmounts.
// This is only browser memory, not recovery of an attempt after a refresh.
export type TrainingRequest = {
  baseline: string[]
  pending: boolean
  error?: string
  failed?: boolean
  fresh?: boolean
  abandoned?: boolean
}

const requests = new Map<string, TrainingRequest>()

export const getTrainingRequest = (id: string) => requests.get(id)

export const setTrainingRequest = (id: string, request: TrainingRequest) => {
  requests.set(id, request)
}

export const clearTrainingRequest = (id: string, request: TrainingRequest) => {
  if (requests.get(id) === request) {
    requests.delete(id)
  }
}
