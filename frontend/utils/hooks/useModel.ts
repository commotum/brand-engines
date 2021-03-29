import useSWR from 'swr'

import { fetcher } from '../utils'
import { BASE_URL } from '../constants'
import { Model } from '../../@types/types'

export function useModel(id: string, url: string = BASE_URL) {
  const { data, error, mutate } = useSWR<Model>(
    `${url}/api/get-model?id=${id}`,
    fetcher,
  )
  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  }
}
