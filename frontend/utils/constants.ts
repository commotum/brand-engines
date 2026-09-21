export const ROUTES = {
  home: '/',
  train: '/train',
  generate: '/generate',
  history: '/history',
}

export const getTrainRoute = (id: string) => {
  return `${ROUTES.train}?id=${encodeURIComponent(id)}`
}

export const getGenerateRoute = (id: string, count?: string | number) => {
  return `${ROUTES.generate}?id=${encodeURIComponent(id)}${
    count ? `&count=${count}` : ''
  }`
}

export const getHistoryRoute = (id: string) => {
  return `${ROUTES.history}?id=${encodeURIComponent(id)}`
}

// NEXT_PUBLIC values are embedded in the browser bundle at build time.
export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '')
  .trim()
  .replace(/\/+$/, '')

const MODEL_DISPLAY_NAMES = new Map([
  ['117M', 'GPT-2 Small (117M)'],
  ['124M', 'GPT-2 Small (124M)'],
  ['355M', 'GPT-2 Medium (355M)'],
  ['774M', 'GPT-2 Large (774M)'],
  ['1558M', 'GPT-2 XL (1558M)'],
])

export const getModelDisplayName = (id: string) => {
  return MODEL_DISPLAY_NAMES.get(id) || id
}
