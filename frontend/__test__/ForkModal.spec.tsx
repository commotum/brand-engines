import React from 'react'

import { render } from '../testUtils'
import { ForkModal } from '../components/ForkModal'

describe('ForkModal', () => {
  it('default', () => {
    const { getByLabelText } = render(
      <ForkModal isOpen onClose={() => {}} onContinue={() => {}} />,
    )

    expect(getByLabelText('Select Training Data')).toBeTruthy()
    expect(getByLabelText('New Model Name:')).toBeTruthy()
  })

  it('className', () => {
    const className = 'className'
    const { getByRole } = render(
      <ForkModal
        className={className}
        isOpen
        onClose={() => {}}
        onContinue={() => {}}
      />,
    )
    expect(getByRole('dialog').className.includes(className)).toBeTruthy()
  })
})
