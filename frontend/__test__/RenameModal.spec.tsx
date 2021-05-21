import React from 'react'
import { waitFor } from '@testing-library/dom'

import { render, fireEvent } from '../testUtils'
import { INPUT_ID } from './Input.spec'
import { RenameModal } from '../components/RenameModal'
import { CANCEL_ID, CONFIRM_ID } from './ModalButtons.spec'

const NAME_ID = 'renameModalName'

describe('RenameModal', () => {
  it('default', () => {
    const currentName = 'CurrentName'
    const { getByTestId } = render(
      <RenameModal
        isOpen
        currentName={currentName}
        onClose={() => {}}
        onSubmit={() => {}}
      />,
    )

    expect(getByTestId(NAME_ID)).toHaveTextContent(currentName)
  })

  it('submit', async () => {
    const spy = jest.fn()
    const value = 'value'
    const { getByTestId } = render(
      <RenameModal
        isOpen
        currentName={'Name'}
        onClose={() => {}}
        onSubmit={spy}
      />,
    )
    fireEvent.change(getByTestId(INPUT_ID), { target: { value } })

    fireEvent.click(getByTestId(CONFIRM_ID))

    await waitFor(() => expect(spy).toHaveBeenCalledWith(value))
  })

  it('cancel', async () => {
    const spy = jest.fn()
    const submitSpy = jest.fn()
    const value = 'value'
    const { getByTestId } = render(
      <RenameModal
        isOpen
        currentName={'Name'}
        onClose={spy}
        onSubmit={submitSpy}
      />,
    )
    fireEvent.change(getByTestId(INPUT_ID), { target: { value } })

    fireEvent.click(getByTestId(CANCEL_ID))
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(0))
  })

  it('className', () => {
    const className = 'className'
    const { getByRole } = render(
      <RenameModal
        isOpen
        className={className}
        currentName="Name"
        onClose={() => {}}
        onSubmit={() => {}}
      />,
    )
    expect(getByRole('dialog').className.includes(className)).toBeTruthy()
  })
})
