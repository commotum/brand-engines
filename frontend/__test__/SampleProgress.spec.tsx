import React from 'react'

import { render } from '../testUtils'
import { LoadingText } from '../components/LoadingText'

it('withholds a partial EOS marker from a live log without losing ordinary newlines', () => {
  const lines = ['======== SAMPLE 1 ========', 'First line', '', '  Next<|endo']
  const { container, rerender } = render(<LoadingText text={lines} active />)
  const sample = () => container.querySelector('section > div')!
  expect(sample().textContent).toBe('First line\n\n  Next')

  rerender(
    <LoadingText
      text={[
        ...lines.slice(0, -1),
        '  Next<|endoftext|>Second tweet',
        '======== END SAMPLE ========',
      ]}
      active
    />,
  )
  expect(sample().children).toHaveLength(2)
  expect(sample().children[0].textContent).toBe('First line\n\n  Next')
  expect(sample().children[1].textContent).toBe('Second tweet\n')

  rerender(<LoadingText text={lines} active={false} />)
  expect(sample().textContent).toBe('First line\n\n  Next<|endo')
})
