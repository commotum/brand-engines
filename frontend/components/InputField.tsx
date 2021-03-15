import React, { TextareaHTMLAttributes } from 'react'
import { useField } from 'formik'
import styled, { css } from 'styled-components'

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
    bottom: -0.8125rem;
    text-align: right;
    width: 100%;
  `,
)

const STextArea = styled.textarea<{ isError?: number }>(
  ({ theme, isError }) => css`
    resize: none;
    display: block;
    margin-top: 0.5rem;
    border: 0.125rem solid ${isError ? theme.color.red : theme.color.gray};
    padding: 1rem 1.25rem;
    color: ${theme.color.black};
    font-size: ${theme.size.default};
    border-radius: ${theme.radius.medium};

    :focus {
      outline: none;
      border-color: ${theme.color.black};
    }
  `,
)

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  name: string
  className?: string
}

export const InputField: React.FC<Props> = ({
  className,
  name,
  label,
  ...rest
}) => {
  const [{ value }, { error, touched }, { setValue }] = useField(name)
  const isError = Boolean(error && touched) ? 1 : 0
  const onChange = React.useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      ev.preventDefault()
      setValue(ev.target.value)
    },
    [setValue],
  )
  return (
    <div className={className} data-testid="inputField">
      <SLabel isError={isError} htmlFor={label}>
        {label}
      </SLabel>
      <STextArea
        id={label}
        isError={isError}
        value={value}
        onChange={onChange}
        data-testid="inputFieldTextArea"
        {...rest}
      />
      {isError ? <Error data-testid="inputFieldError">{error}</Error> : null}
    </div>
  )
}
InputField.displayName = 'InputField'
