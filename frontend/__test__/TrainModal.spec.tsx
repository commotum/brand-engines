import React from 'react'
import { waitFor } from '@testing-library/dom'

import { render, fireEvent } from '../testUtils'
import { INPUT_ID } from './Input.spec'
import { TrainModal } from '../components/TrainModal'

const SUBMIT_ID = 'trainModalSubmit'

describe('TrainModal', () => {
  it('default', () => {
    const { getByTestId, getAllByTestId } = render(
      <TrainModal isOpen onClose={() => {}} onStart={() => {}} />,
    )

    expect(getAllByTestId(INPUT_ID).length).toBe(2)
    expect(getByTestId(SUBMIT_ID)).toHaveTextContent('Start training')
  })

  it('start', async () => {
    const spy = jest.fn()
    const { getByTestId, getAllByTestId } = render(
      <TrainModal isOpen onClose={() => {}} onStart={spy} />,
    )

    const inputElem = getAllByTestId(INPUT_ID)
    inputElem.forEach((elem) => {
      fireEvent.change(elem, { target: { value: 1 } })
    })

    fireEvent.click(getByTestId(SUBMIT_ID))

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  })

  it('values', async () => {
    const spy = jest.fn()
    const value = 1
    const value2 = 2
    const onSubmit = (values: any) => spy(Object.entries(values))
    const { getByTestId, getAllByTestId } = render(
      <TrainModal isOpen onClose={() => {}} onStart={onSubmit} />,
    )

    const inputElem = getAllByTestId(INPUT_ID)
    fireEvent.change(inputElem[0], { target: { value } })
    fireEvent.change(inputElem[1], { target: { value: value2 } })

    fireEvent.click(getByTestId(SUBMIT_ID))

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith([
        ['timesteps', `${value}`],
        ['checkpoint', `${value2}`],
      ]),
    )
  })

  it('className', () => {
    const className = 'className'
    const { getByRole } = render(
      <TrainModal
        className={className}
        isOpen
        onClose={() => {}}
        onStart={() => {}}
      />,
    )
    expect(getByRole('dialog').className.includes(className)).toBeTruthy()
  })
})
