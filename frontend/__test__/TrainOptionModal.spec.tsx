import React from 'react'

import { render, fireEvent } from '../testUtils'
import { TrainOptionModal } from '../components/TrainOptionModal'
import { getItems } from '../utils/mock'
import { useModel } from '../utils/hooks/useModel'

jest.mock('../utils/hooks/useModel')

const MODELS = getItems(1)

export const CONTINUE_ID = 'generateModalContinue'
export const NEW_BRANCH_ID = 'generateModalNewBranch'

describe('TrainOptionModal', () => {
  beforeEach(() => {
    ;(useModel as any).mockImplementationOnce(() => ({
      data: MODELS[0],
      isLoading: false,
      isError: false,
    }))
  })
  it('default', () => {
    const { getByRole } = render(
      <TrainOptionModal
        isOpen
        id=""
        onTrain={() => {}}
        onClose={() => {}}
        onContinue={() => {}}
        onNewBranch={() => {}}
      />,
    )

    expect(getByRole('dialog')).toBeTruthy()
  })

  it('continue', () => {
    const spy = jest.fn()
    const { getByTestId } = render(
      <TrainOptionModal
        isOpen
        id=""
        onTrain={() => {}}
        onClose={() => {}}
        onContinue={spy}
        onNewBranch={() => {}}
      />,
    )

    fireEvent.click(getByTestId(CONTINUE_ID))

    expect(getByTestId(CONTINUE_ID)).toHaveTextContent('Continue Training')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('new branch', () => {
    const spy = jest.fn()
    const { getByTestId } = render(
      <TrainOptionModal
        isOpen
        id=""
        onTrain={() => {}}
        onClose={() => {}}
        onContinue={() => {}}
        onNewBranch={spy}
      />,
    )

    fireEvent.click(getByTestId(NEW_BRANCH_ID))

    expect(getByTestId(NEW_BRANCH_ID)).toHaveTextContent('Create New Branch')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('className', () => {
    const className = 'className'
    const { getByRole } = render(
      <TrainOptionModal
        isOpen
        id=""
        onTrain={() => {}}
        onClose={() => {}}
        onContinue={() => {}}
        onNewBranch={() => {}}
        className={className}
      />,
    )
    expect(getByRole('dialog').className.includes(className)).toBeTruthy()
  })
})
