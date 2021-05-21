import React from 'react'

import { render, fireEvent } from '../testUtils'
import { ModalButtons } from '../components/ModalButtons'

export const ID = 'modalButtons'
export const CONFIRM_ID = 'modalButtonsConfirm'
export const CANCEL_ID = 'modalButtonsCancel'

describe('ModalButtons', () => {
  it('default', () => {
    const { queryByTestId } = render(<ModalButtons />)

    expect(queryByTestId(CONFIRM_ID)).toBeFalsy()
    expect(queryByTestId(CANCEL_ID)).toBeFalsy()
  })

  it('confirm', () => {
    const title = 'Title'
    const spy = jest.fn()
    const { getByTestId } = render(
      <ModalButtons confirm={{ text: title, fn: spy }} />,
    )

    fireEvent.click(getByTestId(CONFIRM_ID))

    expect(getByTestId(CONFIRM_ID)).toHaveTextContent(title)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('cancel', () => {
    const title = 'Title'
    const spy = jest.fn()
    const { getByTestId } = render(
      <ModalButtons cancel={{ text: title, fn: spy }} />,
    )

    fireEvent.click(getByTestId(CANCEL_ID))

    expect(getByTestId(CANCEL_ID)).toHaveTextContent(title)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(<ModalButtons className={className} />)
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
