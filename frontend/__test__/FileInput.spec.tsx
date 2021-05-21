import React from 'react'
import { getByText, waitFor } from '@testing-library/dom'

import { render, fireEvent, FormikWrap } from '../testUtils'
import { FileInput } from '../components/FileInput'

export const ID = 'fileInput'
export const INPUT_ID = 'fileInputField'
const ERROR_ID = 'fileInputError'

describe('FileInput', () => {
  it('default', () => {
    const label = 'Label'
    const { getByLabelText } = render(
      <FormikWrap>
        <FileInput label={label} name="name" />
      </FormikWrap>,
    )

    expect(getByLabelText(label)).toBeTruthy()
  })

  it('error, onSubmit', async () => {
    const error = 'This is error'
    const { getByText, getByTestId } = render(
      <FormikWrap validate={() => ({ name: error })}>
        <FileInput label="Label" name="name" />
      </FormikWrap>,
    )

    fireEvent.submit(getByTestId(INPUT_ID))
    await waitFor(() => expect(getByText(error)).toBeTruthy())
  })

  it('error, not touched', async () => {
    const error = 'This is error'
    const { getByTestId, queryByTestId } = render(
      <FormikWrap
        values={{ name: '', name2: '' }}
        validate={() => ({ name: error })}
      >
        <FileInput label="Label" name="name" />
        <input name="name2" data-testid="test" />
      </FormikWrap>,
    )

    getByTestId('test').focus()
    getByTestId('test').blur()
    await waitFor(() => expect(queryByTestId(ERROR_ID)).not.toBeTruthy())
  })

  it('change', async () => {
    const spy = jest.fn()
    const value = 'value'
    const file = { text: async () => value }
    const { getByTestId } = render(
      <FormikWrap onSubmit={spy}>
        <FileInput label="Label" name="name" />
      </FormikWrap>,
    )
    fireEvent.change(getByTestId(INPUT_ID), { target: { files: [file] } })
    fireEvent.submit(getByTestId(INPUT_ID))

    await waitFor(() => expect(spy).toBeCalledWith([['name', value]]))
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <FormikWrap>
        <FileInput className={className} label="Label" name="name" />
      </FormikWrap>,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
