import React from 'react'

import { render } from '../testUtils'
import { Loading } from '../components/Loading'

const ID = 'loading'
const TITLE_ID = 'loadingTitle'

describe('Loading', () => {
  it('default', () => {
    const title = 'title'
    const { getByTestId } = render(<Loading title={title} />)

    expect(getByTestId(TITLE_ID)).toHaveTextContent(title)
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Loading title="title" className={className} />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
