import React from 'react'

import { render } from '../testUtils'
import Generate from '../pages/generate'
import { useGenerate } from '../utils/hooks/useGenerate'

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '117M' } }),
}))
jest.mock('../utils/hooks/useGenerate')

describe('Generate output', () => {
  it('keeps the prior result visible and identified until a new result arrives', () => {
    const state = {
      data: 'First\n  line<|endoftext|>Second',
      isLoading: false,
      onGenerate: jest.fn(),
    }
    ;(useGenerate as jest.Mock).mockImplementation(() => state)
    const { getByRole, queryByText, rerender } = render(<Generate />)

    const output = getByRole('region', { name: 'Generated text' })
    expect(output).toBeVisible()
    expect(output.textContent).toBe('First\n  lineSecond')

    state.isLoading = true
    rerender(<Generate />)
    expect(output).toBeVisible()
    expect(output.textContent).toBe('Previous outputFirst\n  lineSecond')
    expect(getByRole('button', { name: 'Generating text…' })).toBeDisabled()

    state.data = 'New output'
    state.isLoading = false
    rerender(<Generate />)
    expect(output.textContent).toBe('New output')
    expect(queryByText('Previous output')).toBeNull()
    expect(getByRole('button', { name: 'Generate text' })).toBeEnabled()
  })
})
