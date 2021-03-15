export const ROUTES = {
  home: '/',
  train: '/train',
  generate: '/generate',
  history: '/history',
}

export const getTrainRoute = (id: string) => {
  return `${ROUTES.train}?id=${id}`
}

export const getGenerateRoute = (id: string, count?: string | number) => {
  return `${ROUTES.generate}?id=${id}${count ? `&count=${count}` : ''}`
}

export const getHistoryRoute = (id: string) => {
  return `${ROUTES.history}?id=${id}`
}

export const BASE_URL = ''
