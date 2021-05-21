import React from 'react'

import { render, fireEvent } from '../testUtils'
import { TITLE_ID as CHECKPOINT_ID } from './Checkpoint.spec'
import { Model } from '../components/Model'
import { getCheckpoints } from '../utils/mock'

export const ID = 'model'
export const TITLE_ID = 'modelTitle'

describe('model', () => {
  it('default', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Model
        title={title}
        checkpoints={getCheckpoints(1)}
        onFork={() => {}}
        onGenerate={() => {}}
      />,
    )

    expect(getByTestId(TITLE_ID)).toHaveTextContent(new RegExp(title))
    expect(getByTestId(CHECKPOINT_ID)).toHaveStyle('height: 0')
  })

  it('checkpoints', () => {
    const title = 'Title'
    const checkpoints = getCheckpoints(5)
    const { getAllByTestId, getByTestId } = render(
      <Model
        title={title}
        checkpoints={checkpoints}
        onFork={() => {}}
        onGenerate={() => {}}
      />,
    )

    fireEvent.click(getByTestId(TITLE_ID))
    getAllByTestId(CHECKPOINT_ID).map((elem, i) => {
      expect(elem).toHaveTextContent(new RegExp(checkpoints[i].title))
      expect(elem).not.toHaveStyle('height: 0')
    })
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Model
        className={className}
        title="Title"
        checkpoints={[]}
        onFork={() => {}}
        onGenerate={() => {}}
      />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
