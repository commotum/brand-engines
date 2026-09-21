import React from 'react'
import { waitFor } from '@testing-library/dom'

import { render, fireEvent } from '../testUtils'
import { Sample, SampleContent } from '../components/Sample'

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

describe('SampleContent', () => {
  const eos = '<|endoftext|>'

  it('separates EOS boundaries without treating ordinary newlines as boundaries', () => {
    const first = '  First line\nsecond line\n\n  indented 🐈\t'
    const second = 'Trailing text without a completion marker'
    const { container } = render(
      <SampleContent
        text={`${eos}${first}${eos}${eos} \n${eos}${second}${eos}`}
      />,
    )
    const content = container.firstElementChild!
    expect(content.children).toHaveLength(2)
    expect(content.children[0].textContent).toBe(first)
    expect(content.children[1].textContent).toBe(second)
    expect(content).toHaveStyle('white-space: break-spaces')
  })

  it('preserves ordinary text and treats HTML as text', () => {
    const text =
      '  <img src=x onerror=alert(1)>\n\n<script>alert(1)</script> é猫  '
    const { container } = render(<SampleContent text={text} />)
    expect(container.textContent).toBe(text)
    expect(container.querySelector('img, script')).toBeNull()
    expect(container.firstElementChild!.children).toHaveLength(1)
  })

  it('does not render empty sections for repeated boundaries', () => {
    const { container } = render(
      <SampleContent text={`${eos} \n${eos}${eos}`} />,
    )
    expect(container.firstElementChild!.children).toHaveLength(0)
  })

  it.each(Array.from({ length: eos.length - 1 }, (_, index) => index + 1))(
    'withholds an unresolved EOS prefix of length %i only while pending',
    (length) => {
      const fragment = eos.slice(0, length)
      const { container, rerender } = render(
        <SampleContent text={`First${fragment}`} pending />,
      )
      expect(container.textContent).toBe('First')
      rerender(<SampleContent text={`First${fragment}`} />)
      expect(container.textContent).toBe(`First${fragment}`)
      rerender(<SampleContent text={`First${eos}Second`} pending />)
      expect(container.firstElementChild!.children).toHaveLength(2)
      expect(container.textContent).toBe('FirstSecond')
    },
  )

  it('keeps sample groups distinct when they contain multiple tweets', () => {
    const { getAllByTestId, getByText } = render(
      <Sample
        title="Checkpoint 100"
        samples={[`One${eos}Two`, `Three${eos}Four`, 'Five']}
      />,
    )
    const samples = getAllByTestId(TEXT_ID)
    expect(samples.map((sample) => sample.textContent)).toEqual([
      'OneTwo',
      'ThreeFour',
      'Five',
    ])
    ;['Sample 1', 'Sample 2', 'Sample 3'].forEach((title) => {
      expect(getByText(title)).toBeInTheDocument()
    })
  })
})
