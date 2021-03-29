import useSWR from 'swr'

import { fetcher } from '../utils'
import { BASE_URL } from '../constants'
import { Model, SortKey } from '../../@types/types'

const sortByName = (a: Model, b: Model) => {
  if (a.name < b.name) {
    return -1
  }
  if (a.name > b.name) {
    return 1
  }
  return 0
}

const sortByTime = (a: Model, b: Model) => {
  const aTime = a.history?.[0].created || 0
  const bTime = b.history?.[0].created || 0
  if (aTime < bTime) {
    return -1
  }
  if (aTime > bTime) {
    return 1
  }
  return 0
}

const sortBySteps = (a: Model, b: Model) => {
  const aSteps = a.history?.reduce((res, { steps = 0 }) => steps + res, 0) || 0
  const bSteps = b.history?.reduce((res, { steps = 0 }) => steps + res, 0) || 0
  if (aSteps < bSteps) {
    return -1
  }
  if (aSteps > bSteps) {
    return 1
  }
  return 0
}

const sortByRecent = (a: Model, b: Model) => {
  const aUpdated =
    a.history?.reduce((res, { updated = 0 }) => updated + res, 0) || 0
  const bUpdated =
    b.history?.reduce((res, { updated = 0 }) => updated + res, 0) || 0
  if (aUpdated < bUpdated) {
    return -1
  }
  if (aUpdated > bUpdated) {
    return 1
  }
  return 0
}

const SORTERS: { [key in SortKey]: (a: Model, b: Model) => number } = {
  name: sortByName,
  created: sortByTime,
  steps: sortBySteps,
  updated: sortByRecent,
}

export function useModels(
  regex: string = '',
  sortBy: SortKey,
  url: string = BASE_URL,
) {
  const { data, error, mutate } = useSWR<Model[]>(
    `${url}/api/get-models`,
    fetcher,
  )
  return {
    data: data
      ?.filter((item) => item.name.match(new RegExp(regex, 'i')))
      .sort(SORTERS[sortBy]),
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}
