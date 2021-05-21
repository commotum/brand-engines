import React from 'react'

import { render, fireEvent } from '../testUtils'
import { TEXT_ID, TITLE_ID as SAMPLE_ID } from './Sample.spec'
import { Checkpoint } from '../components/Checkpoint'

export const ID = 'checkpoint'
export const TITLE_ID = 'checkpointTitle'
export const GENERATE_ID = 'checkpointGenerate'
export const BRANCH_ID = 'checkpointBranch'

describe('checkpoint', () => {
  it('default', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Checkpoint
        title={title}
        samples={[]}
        onGenerate={() => {}}
        onFork={() => {}}
      />,
    )

    expect(getByTestId(TITLE_ID)).toHaveTextContent(new RegExp(title))
    expect(getByTestId(TITLE_ID)).not.toHaveStyle('height: 0')
    expect(getByTestId(GENERATE_ID)).toHaveStyle('height: 0')
  })

  it('samples', () => {
    const title = 'Title'
    const samples = ['sample1', 'sample2', 'sample3']
    const { getAllByTestId, getByTestId } = render(
      <Checkpoint
        title={title}
        samples={samples}
        onGenerate={() => {}}
        onFork={() => {}}
      />,
    )

    fireEvent.click(getByTestId(SAMPLE_ID))
    getAllByTestId(TEXT_ID).map((elem, i) => {
      expect(elem).toHaveTextContent(samples[i])
    })
  })

  it('disable', () => {
    const title = 'Title'
    const Component = () => {
      const [disabled, setDisabled] = React.useState(false)
      return (
        <>
          <button
            data-testid="testButton"
            onClick={() => {
              setDisabled((prev) => !prev)
            }}
          />
          <Checkpoint
            disabled={disabled}
            title={title}
            samples={['sample']}
            onGenerate={() => {}}
            onFork={() => {}}
          />
        </>
      )
    }
    const { getByTestId } = render(<Component />)

    fireEvent.click(getByTestId(TITLE_ID))
    fireEvent.click(getByTestId(SAMPLE_ID))
    fireEvent.click(getByTestId('testButton'))

    expect(getByTestId(GENERATE_ID)).toHaveStyle('height: 0')
  })

  it('disabled', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Checkpoint
        disabled
        title={title}
        samples={['sample']}
        onGenerate={() => {}}
        onFork={() => {}}
      />,
    )

    expect(getByTestId(TITLE_ID)).toHaveStyle('height: 0')
  })

  it('open', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Checkpoint
        title={title}
        samples={['sample']}
        onGenerate={() => {}}
        onFork={() => {}}
      />,
    )

    fireEvent.click(getByTestId(TITLE_ID))
    expect(getByTestId(BRANCH_ID)).not.toHaveStyle('height: 0')
    expect(getByTestId(SAMPLE_ID)).not.toHaveStyle('height: 0')
    expect(getByTestId(GENERATE_ID)).not.toHaveStyle('height: 0')
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Checkpoint
        className={className}
        title="Title"
        samples={[]}
        onGenerate={() => {}}
        onFork={() => {}}
      />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
