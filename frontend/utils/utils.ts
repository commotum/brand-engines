export const fetcher = (url: string) => {
  return fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  }).then((res) => {
    if (res.status >= 400) {
      return null
    }
    return res.json()
  })
}

export const deleteFetch = <T>(
  url: string,
  body?: string,
  headers: { [key: string]: string } = {},
): Promise<T | null> => {
  return fetchReq(
    url,
    'DELETE',
    {
      Accept: 'application/json',
      ...headers,
    },
    body,
  )
}

export const getFetch = <T>(
  url: string,
  headers: { [key: string]: string } = {},
): Promise<T | null> => {
  return fetchReq(url, 'GET', {
    Accept: 'application/json',
    ...headers,
  })
}

export const postFetch = <T>(
  url: string,
  body?: string,
  headers: { [key: string]: string } = {},
): Promise<T | null> => {
  return fetchReq(
    url,
    'POST',
    {
      Accept: 'application/json',
      ...headers,
    },
    body,
  )
}

export const fetchReq = async <T>(
  url: string,
  method: string = 'GET',
  headers: { [key: string]: string } = {},
  body?: any,
): Promise<T | null> => {
  return fetch(url, {
    method,
    headers: { ...headers },
    body,
  })
    .then((res) => {
      if (res.status >= 400) {
        return null
      }
      return res.json()
    })
    .catch((e) => {
      console.error(e)
      return null
    })
}
