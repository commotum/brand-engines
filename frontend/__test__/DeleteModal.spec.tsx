import React from 'react'

import { render, fireEvent } from '../testUtils'
import { DeleteModal } from '../components/DeleteModal'
import { TITLE_ID } from './Modal.spec'
import { CANCEL_ID, CONFIRM_ID } from './ModalButtons.spec'

describe('DeleteModal', () => {
  it('default', () => {
    const { getByText, getByTestId } = render(
      <DeleteModal isOpen onClose={() => {}} onDelete={() => {}} />,
    )

    expect(getByTestId(TITLE_ID)).toHaveTextContent('Delete')
    expect(getByText('Are you sure you want to delete?')).toBeTruthy()
    expect(getByTestId(CONFIRM_ID)).toHaveTextContent('Delete')
    expect(getByTestId(CANCEL_ID)).toHaveTextContent('Cancel')
  })

  it('delete', () => {
    const spy = jest.fn()
    const { getByTestId } = render(
      <DeleteModal isOpen onClose={() => {}} onDelete={spy} />,
    )

    fireEvent.click(getByTestId(CONFIRM_ID))

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('cancel', () => {
    const spy = jest.fn()
    const deleteSpy = jest.fn()
    const { getByTestId } = render(
      <DeleteModal isOpen onClose={spy} onDelete={deleteSpy} />,
    )

    fireEvent.click(getByTestId(CANCEL_ID))

    expect(spy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledTimes(0)
  })

  it('className', () => {
    const className = 'className'
    const { getByRole } = render(
      <DeleteModal
        className={className}
        isOpen
        onClose={() => {}}
        onDelete={() => {}}
      />,
    )
    expect(getByRole('dialog').className.includes(className)).toBeTruthy()
  })
})
