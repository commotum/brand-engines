import React from 'react'

import { render } from '../testUtils'
import { Modal } from '../components/Modal'

export const TITLE_ID = 'modalTitle'

describe('Modal', () => {
  it('default', () => {
    const { getByTestId, queryByTestId } = render(
      <Modal isOpen onClose={() => {}}>
        <div data-testid="test" />
      </Modal>,
    )

    expect(getByTestId('test')).toBeTruthy()
    expect(queryByTestId(TITLE_ID)).toBeFalsy()
  })

  it('title', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Modal isOpen title={title} onClose={() => {}} />,
    )

    expect(getByTestId(TITLE_ID)).toHaveTextContent(title)
  })

  it('closed', () => {
    const { queryByTestId } = render(
      <Modal isOpen={false} onClose={() => {}} title="">
        <div data-testid="test" />
      </Modal>,
    )

    expect(queryByTestId('test')).not.toBeTruthy()
  })

  it('className', () => {
    const className = 'className'
    const { getByRole } = render(
      <Modal isOpen onClose={() => {}} className={className} />,
    )
    expect(getByRole('dialog').className.includes(className)).toBeTruthy()
  })
})
