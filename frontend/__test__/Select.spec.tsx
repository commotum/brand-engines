import React from 'react'

import { render } from '../testUtils'
import { Select } from '../components/Select'

const ID = 'select'

describe('Select', () => {
  it('default', () => {
    const { getByTestId } = render(<Select onChange={() => {}} />)

    expect(getByTestId(ID)).toBeTruthy()
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Select onChange={() => {}} className={className} />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
