import React from 'react'

import { render } from '../testUtils'
import { TopPanel } from '../components/TopPanel'

const ID = 'topPanel'
const TITLE_ID = 'topPanelTitle'
const BACK_ID = 'topPanelBack'

describe('TopPanel', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(<TopPanel />)

    expect(getByTestId(ID)).toBeTruthy()
    expect(queryByTestId(TITLE_ID)).not.toBeTruthy()
    expect(queryByTestId(BACK_ID)).not.toBeTruthy()
  })

  it('title', () => {
    const title = 'Tilte'
    const { getByTestId } = render(<TopPanel title={title} />)

    expect(getByTestId(TITLE_ID)).toHaveTextContent(title)
    expect(getByTestId(BACK_ID)).toBeTruthy()
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(<TopPanel className={className} />)
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
