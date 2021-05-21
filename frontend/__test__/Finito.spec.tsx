import React from 'react'

import { render } from '../testUtils'
import { Finito } from '../components/Finito'

const ID = 'finito'

describe('finito', () => {
  it('default', () => {
    const { getByTestId } = render(<Finito />)

    expect(getByTestId(ID)).toBeTruthy()
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(<Finito className={className} />)
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
