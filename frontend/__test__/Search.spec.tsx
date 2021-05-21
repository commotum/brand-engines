import React from 'react'
import { waitFor } from '@testing-library/dom'

import { render, fireEvent } from '../testUtils'
import { Search } from '../components/Search'

const ID = 'search'
const INPUT_ID = 'searchInput'

describe('Search', () => {
  it('default', () => {
    const { getByTestId } = render(<Search onChange={() => {}} />)

    expect(getByTestId(INPUT_ID)).toBeTruthy()
  })

  it('change', async () => {
    const spy = jest.fn()
    const value = 'value'
    const { getByTestId } = render(<Search onChange={spy} />)
    await waitFor(() =>
      fireEvent.change(getByTestId(INPUT_ID), { target: { value } }),
    )

    await waitFor(() => new Promise((res) => setTimeout(res, 350)))
    await waitFor(() => expect(spy).toBeCalledWith(value))
  })

  it('empty', async () => {
    const spy = jest.fn()
    const {} = render(<Search onChange={spy} />)

    await waitFor(() => new Promise((res) => setTimeout(res, 350)))
    await waitFor(() => expect(spy).toBeCalledTimes(0))
  })

  it('enter', async () => {
    const spy = jest.fn()
    const value = 'Value'
    const { getByTestId } = render(<Search value={value} onChange={spy} />)
    fireEvent.submit(getByTestId(INPUT_ID))

    await waitFor(() => expect(spy).toBeCalledWith(value))
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Search onChange={() => {}} className={className} />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
