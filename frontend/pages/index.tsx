import { NextPage } from 'next'
import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'

import { TopPanel } from '../components/TopPanel'
import { useModels } from '../utils/hooks/useModels'
import { Throbber } from '../components/Throbber'
import { ItemGrid } from '../components/ItemGrid'
import {
  getGenerateRoute,
  getHistoryRoute,
  getTrainRoute,
} from '../utils/constants'
import { SortKey } from '../@types/types'

const Wrap = styled.div`
  width: 100%;
  position: relative;
  max-width: 85rem;
  margin: 0 auto;
  padding: 0 1rem;
`

type Props = {}

const Index: NextPage<Props> = () => {
  const router = useRouter()
  const [search, onSearch] = React.useState('')
  const [sort, onSort] = React.useState<SortKey>('name')
  const { data, isLoading, isError, refresh } = useModels(search, sort)






  if (isLoading) {
    return (
      <Wrap>
        <TopPanel />
        <Throbber centered />
      </Wrap>
    )
  }
  if (isError || !data) {
    return (
      <Wrap>
        <TopPanel />
        Ups, Something is broken
      </Wrap>
    )
  }
  return (
    <Wrap>
      <TopPanel onSearch={onSearch} onSort={onSort} />
      <ItemGrid
        items={data}
      />
    </Wrap>
  )
}
Index.displayName = 'Index'

export default Index
