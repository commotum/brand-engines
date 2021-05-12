import useSWR from 'swr'

import { fetcher } from '../utils'
import { BASE_URL } from '../constants'
import { Model, Samples } from '../../@types/types'

export function useSteps(
  id: string,
  amount: number = 0,
  url: string = BASE_URL,
) {
  const { data, error } = useSWR<Samples>(
    `${url}/api/get-model-steps?id=${id}${amount ? `&amount=${amount}` : ''}`,
    fetcher,
  )
  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}
