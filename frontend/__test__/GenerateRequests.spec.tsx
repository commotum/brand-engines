import React from 'react'

import { act, fireEvent, render, waitFor } from '../testUtils'
import Generate from '../pages/generate'
import { generateModel } from '../utils/calls'

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '117M' } }),
}))
jest.mock('../utils/calls')

it.each(['null', 'rejection'])(
  'retains prior output and inputs on %s, guards duplicate submits, and allows retry',
  async (failure) => {
    let finish: () => void = () => {}
    const generate = generateModel as jest.Mock
    generate.mockReset()
    generate.mockResolvedValueOnce('Prior output')
    generate.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          finish = () => {
            if (failure === 'null') {
              resolve(null)
            } else {
              reject(new Error('Connection lost'))
            }
          }
        }),
    )
    generate.mockResolvedValueOnce('New output')
    const { getByRole, getByLabelText, getByTestId, queryByRole } = render(
      <Generate />,
    )
    fireEvent.change(getByLabelText('Prompt'), {
      target: { value: 'Keep this prompt' },
    })
    fireEvent.click(getByRole('button', { name: 'Generate text' }))
    await waitFor(() =>
      expect(getByRole('region', { name: 'Generated text' })).toHaveTextContent(
        'Prior output',
      ),
    )
    fireEvent.click(getByRole('button', { name: 'Generate text' }))
    await waitFor(() => expect(generate).toHaveBeenCalledTimes(2))
    expect(getByRole('button', { name: 'Generating text…' })).toBeDisabled()
    fireEvent.submit(getByTestId('generate'))
    await act(async () => {})
    expect(generate).toHaveBeenCalledTimes(2)
    expect(getByRole('region', { name: 'Generated text' })).toBeVisible()

    await act(async () => finish())
    expect(getByRole('alert')).toHaveTextContent(
      failure === 'null' ? 'Could not generate text' : 'Connection lost',
    )
    expect(getByRole('region', { name: 'Generated text' })).toHaveTextContent(
      'Previous outputPrior output',
    )
    expect(getByLabelText('Prompt')).toHaveValue('Keep this prompt')
    expect(getByRole('button', { name: 'Generate text' })).toBeEnabled()

    fireEvent.click(getByRole('button', { name: 'Generate text' }))
    await waitFor(() =>
      expect(getByRole('region', { name: 'Generated text' })).toHaveTextContent(
        'New output',
      ),
    )
    expect(queryByRole('alert')).toBeNull()
    expect(generate).toHaveBeenCalledTimes(3)
    expect(generate).toHaveBeenLastCalledWith(
      '117M',
      1,
      0,
      50,
      'Keep this prompt',
      undefined,
    )
  },
)
