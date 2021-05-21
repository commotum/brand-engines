import React from 'react'
import { Field } from 'formik'
import { waitFor } from '@testing-library/dom'

import { render, fireEvent, FormikWrap } from '../testUtils'
import { AutoSave } from '../components/AutoSave'

const INPUT_ID = 'inputID'

describe('AutoSave', () => {
  it('default', async () => {
    const spy = jest.fn()
    const time = 300
    const {} = render(
      <FormikWrap onSubmit={spy}>
        <AutoSave time={time} />
      </FormikWrap>,
    )

    await waitFor(() => new Promise((res) => setTimeout(res, time + 10)))
    expect(spy).toBeCalledTimes(0)
  })

  it('onChange', async () => {
    const spy = jest.fn()
    const time = 300
    const { getByTestId } = render(
      <FormikWrap onSubmit={spy}>
        <Field name="name" data-testid={INPUT_ID} />
        <AutoSave time={time} />
      </FormikWrap>,
    )

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'qw' },
    })
    await waitFor(() => new Promise((res) => setTimeout(res, time + 10)))
    await waitFor(() => expect(spy).toBeCalledTimes(1))
  })

  it('debounce', async () => {
    const spy = jest.fn()
    const time = 300
    const { getByTestId } = render(
      <FormikWrap onSubmit={spy}>
        <Field name="name" data-testid={INPUT_ID} />
        <AutoSave time={time} />
      </FormikWrap>,
    )

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'q' },
    })

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'qw' },
    })

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'qwe' },
    })

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'qwer' },
    })

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'qwert' },
    })

    fireEvent.change(getByTestId(INPUT_ID), {
      target: { value: 'qwerty' },
    })

    await waitFor(() => new Promise((res) => setTimeout(res, time + 10)))
    await waitFor(() => expect(spy).toBeCalledTimes(1))
    await waitFor(() => expect(spy).toBeCalledWith([['name', 'qwerty']]))
  })
})
