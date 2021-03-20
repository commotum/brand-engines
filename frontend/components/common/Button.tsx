import React from 'react'
import styled, { css } from 'styled-components'

export const Button = styled.button(
  ({ theme }) => css`
    padding: 0.5rem 1.25rem;
    font-weight: 600;
    border: 0.125rem solid transparent;
    font-size: ${theme.size.default};
    color: ${theme.color.black};
    background-color: ${theme.color.white};
    position: relative;
    cursor: pointer;
    white-space: nowrap;
    width: min-content;
    border-radius: ${theme.radius.default};
    transition: 150ms box-shadow;
    box-shadow: ${theme.boxShadow.default};

    :hover:not(disabled) {
      background-color: ${theme.color.black};
      color: ${theme.color.white};
    }

    :active:not(disabled) {
      top: 0.1875rem;
      box-shadow: 0 0;
    }

    :active:not(disabled),
    :focus:not(disabled) {
      border-color: ${theme.color.black};
    }

    :disabled {
      cursor: default;
      box-shadow: none;
      opacity: 0.5;

      :hover {
        box-shadow: none;
        background-color: transparent;
        color: ${theme.color.black};
      }
    }
  `,
)

export const SecButton = styled(Button)(
  ({ theme }) => css`
    color: ${theme.color.medium};
    background-color: transparent;
    top: 0.1875rem;
    box-shadow: none;

    :hover:not(disabled) {
      background-color: ${theme.color.lightGray};
      color: ${theme.color.medium};
      top: 0;
      box-shadow: ${theme.boxShadow.default};
    }

    :active:not(disabled) {
      top: 0.1875rem;
      box-shadow: 0 0;
    }

    :active:not(disabled),
    :focus:not(disabled) {
      border-color: ${theme.color.black};
    }

    :disabled {
      :hover {
        top: 0.1875rem;
        color: ${theme.color.medium};
      }
    }
  `,
)
