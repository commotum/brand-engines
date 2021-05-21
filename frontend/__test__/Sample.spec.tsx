import React from 'react'
import { waitFor } from '@testing-library/dom'

import { render, fireEvent } from '../testUtils'
import { Sample } from '../components/Sample'

export const ID = 'sample'
export const TITLE_ID = 'sampleTitle'
export const COLLAPSE_ID = 'sampleCollapse'
export const TEXT_ID = 'sampleText'

describe('sample', () => {
  it('default', () => {
    const title = 'Title'
    const { getByTestId } = render(<Sample title={title} samples={[]} />)

    expect(getByTestId(TITLE_ID)).toHaveTextContent(new RegExp(title))
    expect(getByTestId(COLLAPSE_ID)).toHaveStyle('height: 0')
  })

  it('samples', () => {
    const title = 'Title'
    const samples = ['sample1', 'sample2', 'sample3']
    const { getAllByTestId } = render(
      <Sample title={title} samples={samples} />,
    )
    getAllByTestId(TEXT_ID).map((elem, i) => {
      expect(elem).toHaveTextContent(samples[i])
    })
  })

  it('disable', async () => {
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
          <Sample disabled={disabled} title={title} samples={['sample']} />
        </>
      )
    }
    const { getByTestId } = render(<Component />)

    fireEvent.click(getByTestId(TITLE_ID))
    fireEvent.click(getByTestId('testButton'))

    await waitFor(() =>
      expect(getByTestId(COLLAPSE_ID)).toHaveStyle('height: 0'),
    )
  })

  it('disabled', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Sample disabled title={title} samples={['sample']} />,
    )

    expect(getByTestId(TITLE_ID)).toHaveStyle('height: 0')
  })

  it('open', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Sample title={title} samples={['sample']} />,
    )

    fireEvent.click(getByTestId(TITLE_ID))
    expect(getByTestId(COLLAPSE_ID)).toHaveStyle('height: min-content')
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Sample className={className} title="Title" samples={[]} />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
