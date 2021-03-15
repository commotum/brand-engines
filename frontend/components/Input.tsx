import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik'
import styled, { css } from 'styled-components'

const Wrap = styled.div`
  position: relative;
`

const SLabel = styled.label<{ isError?: number }>(
  ({ theme, isError }) => css`
    color: ${isError ? theme.color.red : theme.color.medium};
    font-size: ${theme.size.default};
    font-weight: 600;
  `,
)

const Error = styled.div(
  ({ theme }) => css`
    font-size: ${theme.size.small};
    color: ${theme.color.red};
    position: absolute;
    bottom: -1rem;
    text-align: right;
    width: 100%;
  `,
)

const SInput = styled.input<{ isError?: number }>(
  ({ theme, isError }) => css`
    display: block;
    margin-top: 0.5rem;
    border: 0.125rem solid ${isError ? theme.color.red : theme.color.gray};
    padding: 1rem 1.25rem;
    width: 100%;
    color: ${theme.color.black};
    font-size: ${theme.size.default};
    border-radius: ${theme.radius.medium};

    :focus {
      outline: none;
      border-color: ${theme.color.black};
    }
  `,
)

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  name: string
  className?: string
}

export const Input: React.FC<Props> = ({ className, name, label, ...rest }) => {
  const [field, { error, touched }] = useField(name)
  const isError = Boolean(error && touched) ? 1 : 0
  return (
    <Wrap className={className} data-testid="input">
      <SLabel isError={isError} htmlFor={label}>
        {label}
      </SLabel>
      <SInput
        id={label}
        isError={isError}
        data-testid="inputField"
        {...field}
        {...rest}
      />
      {isError ? <Error data-testid="inputError">{error}</Error> : null}
    </Wrap>
  )
}
Input.displayName = 'Input'
