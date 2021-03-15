export type Model = {
  name: string
  core: boolean
  training?: boolean
  generating?: boolean
  history: {
    id: string
    created: number
    updated: number
    steps?: number
    file?: string
  }[]
}

export type SamplesData = { data: string[]; loss: number; avg_loss: number }

export type Samples = {
  [key: string]: SamplesData
}

export type SortKey = 'name' | 'created' | 'steps' | 'updated'
