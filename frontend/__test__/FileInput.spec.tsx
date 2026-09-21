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
    const file = { name: 'tweets.txt', text: async () => value }
    const { getByTestId } = render(
      <FormikWrap onSubmit={spy}>
        <FileInput label="Label" name="name" />
      </FormikWrap>,
    )
    fireEvent.change(getByTestId(INPUT_ID), { target: { files: [file] } })
    await waitFor(() => expect(getByTestId(INPUT_ID)).not.toBeDisabled())
    fireEvent.submit(getByTestId(INPUT_ID))

    await waitFor(() => expect(spy).toBeCalledWith([['name', value]]))
  })

  it('describes local reading and selection without claiming an upload', async () => {
    let finish: (value: string) => void = () => {}
    const file = {
      name: 'tweets.txt',
      text: () =>
        new Promise<string>((resolve) => {
          finish = resolve
        }),
    }
    const { getByTestId, getByRole } = render(
      <FormikWrap>
        <FileInput label="File" name="name" />
      </FormikWrap>,
    )
    fireEvent.change(getByTestId(INPUT_ID), { target: { files: [file] } })
    expect(getByRole('status')).toHaveTextContent('Reading tweets.txt…')
    expect(getByTestId(INPUT_ID)).toBeDisabled()
    finish('tweets')
    await waitFor(() =>
      expect(getByRole('status')).toHaveTextContent('tweets.txt selected'),
    )
  })

  it('reads each selected file once and reports read failures', async () => {
    const first = {
      name: 'first.txt',
      text: jest.fn().mockResolvedValue('first'),
    }
    const second = {
      name: 'second.txt',
      text: jest.fn().mockResolvedValue('second'),
    }
    const submit = jest.fn()
    const { getByTestId, getByText } = render(
      <FormikWrap onSubmit={submit}>
        <FileInput label="File" name="name" />
      </FormikWrap>,
    )
    fireEvent.change(getByTestId(INPUT_ID), {
      target: { files: [first, second] },
    })
    await waitFor(() => expect(getByTestId(INPUT_ID)).not.toBeDisabled())
    fireEvent.submit(getByTestId(INPUT_ID))
    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith([['name', 'firstsecond']]),
    )
    fireEvent.change(getByTestId(INPUT_ID), {
      target: {
        files: [
          {
            name: 'bad.txt',
            text: () => Promise.reject(new Error('Read failed')),
          },
        ],
      },
    })
    await waitFor(() =>
      expect(
        getByText('Could not read the selected file. Please try again.'),
      ).toBeTruthy(),
    )
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
