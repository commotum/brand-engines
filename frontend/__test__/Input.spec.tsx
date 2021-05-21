import React from 'react'
import { getByText, waitFor } from '@testing-library/dom'

import { render, fireEvent, FormikWrap } from '../testUtils'
import { Input } from '../components/Input'

export const ID = 'input'
export const INPUT_ID = 'inputField'
const ERROR_ID = 'inputError'

describe('Input', () => {
  it('default', () => {
    const label = 'Label'
    const placeholder = 'Placeholder'
    const type = 'Password'
    const { getByTestId, getByLabelText } = render(
      <FormikWrap>
        <Input
          label={label}
          name="name"
          type={type}
          placeholder={placeholder}
        />
      </FormikWrap>,
    )

    expect(getByLabelText(label)).toBeTruthy()
    expect(getByTestId(INPUT_ID)).toHaveAttribute('placeholder', placeholder)
    expect(getByTestId(INPUT_ID)).toHaveAttribute('type', type)
  })

  it('error, onSubmit', async () => {
    const error = 'This is error'
    const { getByText, getByTestId } = render(
      <FormikWrap validate={() => ({ name: error })}>
        <Input label="Label" name="name" />
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
        <Input label="Label" name="name" />
        <input name="name2" data-testid="test" />
      </FormikWrap>,
    )

    getByTestId('test').focus()
    getByTestId('test').blur()
    await waitFor(() => expect(queryByTestId(ERROR_ID)).not.toBeTruthy())
  })

  it('error, touched', async () => {
    const error = 'This is error'
    const { getByTestId } = render(
      <FormikWrap
        values={{ name: '', name2: '' }}
        validate={() => ({ name: error })}
      >
        <Input label="Label" name="name" />
      </FormikWrap>,
    )

    getByTestId(INPUT_ID).focus()
    getByTestId(INPUT_ID).blur()
    await waitFor(() => expect(getByTestId(ERROR_ID)).toBeTruthy())
  })

  it('change', async () => {
    const spy = jest.fn()
    const value = 'value'
    const { getByTestId } = render(
      <FormikWrap onSubmit={spy}>
        <Input label="Label" name="name" />
      </FormikWrap>,
    )
    fireEvent.change(getByTestId(INPUT_ID), { target: { value } })
    fireEvent.submit(getByTestId(INPUT_ID))

    await waitFor(() => expect(spy).toBeCalledWith([['name', value]]))
  })

  it('value', async () => {
    const spy = jest.fn()
    const value = 'Value'
    const { getByTestId } = render(
      <FormikWrap values={{ name: value }} onSubmit={spy}>
        <Input label="Label" name="name" />
      </FormikWrap>,
    )
    fireEvent.submit(getByTestId(INPUT_ID))

    await waitFor(() => expect(spy).toBeCalledWith([['name', value]]))
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <FormikWrap>
        <Input className={className} label="Label" name="name" />
      </FormikWrap>,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
