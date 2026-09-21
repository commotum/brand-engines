import React from 'react'

import { render, fireEvent, waitFor } from '../testUtils'
import History from '../pages/history'
import { useModel } from '../utils/hooks/useModel'
import { forkModel } from '../utils/calls'

const mockPush = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: 'Dril' }, push: mockPush }),
}))
jest.mock('../utils/hooks/useModel')
jest.mock('../utils/calls')
jest.mock('../components/Model', () => ({
  SmartModel: ({ onFork }: { onFork(id: string, count: string): void }) => (
    <button onClick={() => onFork('Dril', '100')}>Fork checkpoint</button>
  ),
}))

it('distinguishes loading, unavailable history, and empty history', () => {
  const refresh = jest.fn()
  ;(useModel as jest.Mock).mockReturnValue({ isLoading: true })
  const view = render(<History />)
  expect(view.getByRole('status')).toHaveTextContent('Loading model history…')
  ;(useModel as jest.Mock).mockReturnValue({ isError: true, refresh })
  view.rerender(<History />)
  expect(view.getByRole('alert')).toHaveTextContent(
    'Could not load model history.',
  )
  fireEvent.click(view.getByText('Retry'))
  expect(refresh).toHaveBeenCalledTimes(1)
  ;(useModel as jest.Mock).mockReturnValue({
    data: { name: 'Dril', history: [] },
    refresh,
  })
  view.rerender(<History />)
  expect(view.getByText('No model history yet.')).toBeTruthy()
  expect(view.queryByRole('alert')).toBeNull()
})

it('returns to the original home route after preparing a branch from history', async () => {
  ;(useModel as jest.Mock).mockReturnValue({
    data: {
      name: 'Dril',
      history: [
        { id: 'Dril', created: 1, steps: 100 },
        { id: '117M', created: 1 },
      ],
    },
  })
  ;(forkModel as jest.Mock).mockResolvedValue({ success: true })
  const { getByText, getByLabelText, getByTestId } = render(<History />)
  fireEvent.click(getByText('Fork checkpoint'))
  fireEvent.change(getByLabelText('New Model Name:'), {
    target: { value: 'Dril-2' },
  })
  fireEvent.change(getByTestId('fileInputField'), {
    target: { files: [{ name: 'tweets.txt', text: async () => 'tweets' }] },
  })
  await waitFor(() => expect(getByTestId('uploadModalSubmit')).toBeEnabled())
  fireEvent.click(getByText('Continue'))
  await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'))
  expect(forkModel).toHaveBeenCalledWith('Dril', 'Dril-2', 'tweets', '100')
})
