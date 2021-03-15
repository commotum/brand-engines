import { v4 as uuidv4 } from 'uuid'

import { deleteFetch, getFetch, postFetch } from './utils'
import { Model } from '../@types/types'
import { BASE_URL } from './constants'

export const renameModel = async (name: string, newName: string) => {
  return postFetch<Model>(
    `${BASE_URL}/api/rename-model?id=${name}&new_id=${newName}`,
  )
}

export const trainModel = async (
  name: string,
  every: string,
  steps: string,
) => {
  return postFetch<Model>(
    `${BASE_URL}/api/train-model?id=${name}&every=${every}&steps=${steps}`,
  )
}

export const readTrainModel = async (id: string) => {
  return getFetch<string[]>(
    `${BASE_URL}/api/read-train-model?id=${id}&cb=${uuidv4()}`,
  )
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
    `${BASE_URL}/api/generate-model?id=${id}${
      temperature ? `&temperature=${temperature}` : ''
    }${length ? `&length=${length}` : ''}${top_k ? `&top_k=${top_k}` : ''}${
      input ? `&input=${input}` : ''
    }${count ? `&count=${count}` : ''}`,
  )
}

export const getModel = async (id: string) => {
  return getFetch<Model>(`${BASE_URL}/api/get-model?id=${id}`)
}

export const deleteModel = async (name: string) => {
  return deleteFetch<Model>(`${BASE_URL}/api/delete-model?id=${name}`)
}

export const forkModel = async (
  name: string,
  newName: string,
  dataset: string,
  count?: number | string,
) => {
  return postFetch<Model>(
    `${BASE_URL}/api/fork-model?id=${name}&new_id=${newName}${
      count ? `&count=${count}` : ''
    }`,
    dataset,
  )
}
