import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import '@testing-library/jest-dom/extend-expect'
import { Form, Formik } from 'formik'

import { theme } from './themes'

jest.mock('next/image', () => (props: any) => React.createElement('img', props))

jest.mock('next/link', () => ({ children, href }: any) =>
  React.Children.map(children, (child) =>
    React.cloneElement(child, {
      href,
    }),
  ),
)

export const FormikWrap: React.FC<{
  onSubmit?: any
  values?: any
  validate?: any
}> = ({
  onSubmit = () => {},
  validate = () => ({}),
  values = { name: '' },
  children,
}) => {
  return (
    <Formik
      initialValues={{ ...values }}
      validate={validate}
      onSubmit={(values) => onSubmit(Object.entries(values))}
    >
      {() => {
        return <Form data-testid="form">{children}</Form>
      }}
    </Formik>
  )
}

const AllTheProviders: React.FC = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders })
}

export * from '@testing-library/react'

export { customRender as render }
