import React from 'react'

import { render } from '../testUtils'
import { Throbber } from '../components/Throbber'

export const ID = 'throbber'

describe('throbber', () => {
  it('default', () => {
    const { getByTestId } = render(<Throbber />)

    expect(getByTestId(ID)).toBeTruthy()
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(<Throbber className={className} />)
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
