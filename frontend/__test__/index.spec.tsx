import React from 'react'

import { render } from '../testUtils'
import Index from '../pages'
import { TITLE_ID } from './Item.spec'
import { ID as THROBBER_ID } from './Throbber.spec'
import { getItems } from '../utils/mock'
import { useModels } from '../utils/hooks/useModels'

jest.mock('../utils/hooks/useModels')

const MODELS = getItems(50)

describe('Index', () => {
  it('default', () => {
    ;(useModels as any).mockImplementationOnce(() => ({
      data: MODELS,
      isLoading: false,
      isError: false,
    }))
    const { getAllByTestId } = render(<Index />)
    getAllByTestId(TITLE_ID).forEach((elem, i) => {
      expect(elem).toHaveTextContent(MODELS[i].name)
    })
  })

  it('loading', () => {
    ;(useModels as any).mockImplementationOnce(() => ({
      data: [],
      isLoading: true,
      isError: false,
    }))
    const { getByTestId } = render(<Index />)
    expect(getByTestId(THROBBER_ID)).toBeTruthy()
  })

  it('error', () => {
    ;(useModels as any).mockImplementationOnce(() => ({
      data: [],
      isLoading: false,
      isError: true,
    }))
    const { getByText } = render(<Index />)
    expect(getByText('Ups, Something is broken')).toBeTruthy()
  })
})
