import React from 'react'

import { render, fireEvent, waitFor, act } from '../testUtils'
import { useFork } from '../utils/hooks/useFork'
import { useRename } from '../utils/hooks/useRename'
import { useDelete } from '../utils/hooks/useDelete'
import { ForkModal } from '../components/ForkModal'
import { RenameModal } from '../components/RenameModal'
import { DeleteModal } from '../components/DeleteModal'
import { forkModel, renameModel, deleteModel } from '../utils/calls'

jest.mock('../utils/calls')

const refresh = jest.fn()

function Rename() {
  const state = useRename(refresh)
  return (
    <>
      <button onClick={() => state.onRename('old')}>Open</button>
      <RenameModal {...state} currentName="old" />
    </>
  )
}

function Delete() {
  const state = useDelete(refresh)
  return (
    <>
      <button onClick={() => state.onDelete('old')}>Open</button>
      <DeleteModal {...state} onDelete={state.onDeleteConfirm} />
    </>
  )
}

function Fork() {
  const state = useFork(refresh)
  return (
    <>
      <button onClick={() => state.onForkOpen('old')}>Open</button>
      <ForkModal {...state} onContinue={state.onFork} />
      <span>{state.readyName && `${state.readyName} is ready to train`}</span>
    </>
  )
}

beforeEach(() => jest.clearAllMocks())

it('retains a rename and allows retry after a failed request', async () => {
  let finish: (value: any) => void = () => {}
  ;(renameModel as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    .mockResolvedValue({ success: true })
  const { getByText, getByLabelText, getByTestId, queryByRole } = render(
    <Rename />,
  )
  fireEvent.click(getByText('Open'))
  fireEvent.change(getByLabelText('New Name:'), {
    target: { value: 'New name' },
  })
  fireEvent.click(getByText('Submit'))
  await waitFor(() =>
    expect(getByTestId('modalButtonsConfirm')).toHaveTextContent('Renaming…'),
  )
  expect(getByTestId('modalButtonsConfirm')).toBeDisabled()
  fireEvent.submit(getByLabelText('New Name:'))
  await act(async () => {
    finish(null)
  })
  expect(renameModel).toHaveBeenCalledTimes(1)
  expect(getByLabelText('New Name:')).toHaveValue('New name')
  expect(queryByRole('alert')).toHaveTextContent('Could not rename')
  fireEvent.click(getByText('Submit'))
  await waitFor(() => expect(queryByRole('dialog')).toBeNull())
  expect(renameModel).toHaveBeenCalledTimes(2)
})

it('keeps deletion open on failure and prevents duplicate requests', async () => {
  let finish: (value: any) => void = () => {}
  ;(deleteModel as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    .mockResolvedValue({ success: true })
  const { getByText, getByTestId, getByRole, queryByRole } = render(<Delete />)
  fireEvent.click(getByText('Open'))
  fireEvent.click(getByTestId('modalButtonsConfirm'))
  expect(getByTestId('modalButtonsConfirm')).toHaveTextContent('Deleting…')
  expect(getByTestId('modalButtonsConfirm')).toBeDisabled()
  fireEvent.click(getByTestId('modalButtonsConfirm'))
  await act(async () => {
    finish(null)
  })
  expect(deleteModel).toHaveBeenCalledTimes(1)
  expect(getByRole('alert')).toHaveTextContent('Could not delete')
  fireEvent.click(getByTestId('modalButtonsConfirm'))
  await waitFor(() => expect(queryByRole('dialog')).toBeNull())
})

it('keeps branch inputs through failure and confirms preparation without starting training', async () => {
  let finish: (value: any) => void = () => {}
  ;(forkModel as jest.Mock)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    .mockResolvedValue({ success: true })
  const {
    getByText,
    getByLabelText,
    getByTestId,
    getByRole,
    queryByRole,
  } = render(<Fork />)
  fireEvent.click(getByText('Open'))
  fireEvent.change(getByLabelText('New Model Name:'), {
    target: { value: 'Dril-2' },
  })
  fireEvent.change(getByTestId('fileInputField'), {
    target: { files: [{ name: 'tweets.txt', text: async () => 'tweets' }] },
  })
  await waitFor(() =>
    expect(getByTestId('uploadModalSubmit')).not.toBeDisabled(),
  )
  fireEvent.click(getByText('Continue'))
  await waitFor(() =>
    expect(
      getByText('Preparing Dril-2 with the selected training data…'),
    ).toBeTruthy(),
  )
  expect(getByLabelText('New Model Name:')).toHaveValue('Dril-2')
  expect(getByTestId('uploadModalSubmit')).toBeDisabled()
  fireEvent.submit(getByLabelText('New Model Name:'))
  await act(async () => {
    finish(null)
  })
  expect(forkModel).toHaveBeenCalledTimes(1)
  expect(getByRole('alert')).toHaveTextContent('Could not prepare')
  expect(getByText('tweets.txt selected')).toBeTruthy()
  fireEvent.click(getByText('Continue'))
  await waitFor(() => expect(queryByRole('dialog')).toBeNull())
  expect(getByText('Dril-2 is ready to train')).toBeTruthy()
  expect(forkModel).toHaveBeenLastCalledWith(
    'old',
    'Dril-2',
    'tweets',
    undefined,
  )
})
