import { v4 as uuidv4 } from 'uuid'

import { deleteFetch, getFetch, postFetch } from './utils'
import { Model } from '../@types/types'
import { BASE_URL } from './constants'

const readStatus = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Unable to read training status (${response.status})`)
  }
  return response.json()
}

export const renameModel = async (name: string, newName: string) => {
  return postFetch<Model>(
    `${BASE_URL}/api/rename-model?id=${encodeURIComponent(
      name,
    )}&new_id=${encodeURIComponent(newName)}`,
  )
}

export const trainModel = async (
  name: string,
  every: string,
  steps: string,
) => {
  const response = await fetch(
    `${BASE_URL}/api/train-model?id=${encodeURIComponent(
      name,
    )}&every=${every}&steps=${steps}`,
    { method: 'POST', headers: { Accept: 'application/json' } },
  )
  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    const error = new Error(
      detail?.error || `Training request failed (${response.status})`,
    )
    // The local backend reports validation, busy, and worker errors as JSON
    // on these statuses. A proxy timeout or generic server error proves no outcome.
    Object.assign(error, {
      trainingFailed:
        [400, 403, 409].includes(response.status) &&
        typeof detail?.error === 'string',
    })
    throw error
  }
  return response.json()
}

export const readTrainModel = async (id: string, silent = false) => {
  const url = `${BASE_URL}/api/read-train-model?id=${encodeURIComponent(
    id,
  )}&cb=${uuidv4()}`
  return silent ? readStatus<string[]>(url) : getFetch<string[]>(url)
}

export const generateModel = async (
  id: string,
  temperature?: number,
  top_k?: number,
  length?: number,
  input?: string,
  count?: string | number,
) => {
  return getFetch<string>(
    `${BASE_URL}/api/generate-model?id=${encodeURIComponent(id)}${
      temperature ? `&temperature=${temperature}` : ''
    }${length ? `&length=${length}` : ''}${top_k ? `&top_k=${top_k}` : ''}${
      input ? `&input=${encodeURIComponent(input)}` : ''
    }${count ? `&count=${count}` : ''}`,
  )
}

export const getModel = async (id: string, silent = false) => {
  const url = `${BASE_URL}/api/get-model?id=${encodeURIComponent(id)}`
  return silent ? readStatus<Model>(url) : getFetch<Model>(url)
}

export const deleteModel = async (name: string) => {
  return deleteFetch<Model>(
    `${BASE_URL}/api/delete-model?id=${encodeURIComponent(name)}`,
  )
}

export const forkModel = async (
  name: string,
  newName: string,
  dataset: string,
  count?: number | string,
) => {
  return postFetch<Model>(
    `${BASE_URL}/api/fork-model?id=${encodeURIComponent(
      name,
    )}&new_id=${encodeURIComponent(newName)}${count ? `&count=${count}` : ''}`,
    dataset,
  )
}
