import React from 'react'
import ReactSelect from 'react-select'
import styled, { css } from 'styled-components'

import { SortKey } from '../@types/types'

const Wrap = styled.div(
  ({ theme }) => css`
    max-width: 13rem;
    width: 100%;
    font-size: ${theme.size.default};
    .react-select__control {
      cursor: pointer;
      border: 0;
      box-shadow: ${theme.boxShadow.default};
      border-radius: ${theme.radius.default};
    }

    .react-select__single-value {
      color: ${theme.color.black};
      font-weight: 500;
    }

    .react-select__option {
      color: ${theme.color.medium};
      font-weight: 500;

      :nth-child(odd) {
        background-color: ${theme.color.lightGray};
      }
    }

    .react-select__indicator {
      color: ${theme.color.gray};
    }

    .react-select__value-container {
      padding: 0;
    }

    .react-select__indicator-separator {
      display: none;
    }

    .react-select__indicator {
      transition: 300ms transform ease-in-out;
    }

    .react-select__value-container {
      :before {
        content: 'Sort by';
        color: ${theme.color.medium};
        margin-left: 1rem;
      }
    }

    .react-select__control--menu-is-open {
      border-radius: 0;

      .react-select__indicator {
        transform: rotate(180deg);
      }
    }

    .react-select__menu {
      box-shadow: ${theme.boxShadow.default};
      margin-top: 0;
    }

    .react-select__menu-list {
      padding: 0;
    }

    .react-select__option--is-focused,
    .react-select__option:active {
      color: ${theme.color.white} !important;
      background-color: ${theme.color.medium} !important;
    }

    .react-select__single-value,
    .react-select__option {
      padding-left: 5rem;
      margin: 0;
      box-sizing: border-box;
      cursor: pointer;
    }
  `,
)

const Options: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'created', label: 'Created' },
  { value: 'steps', label: 'Steps' },
  { value: 'updated', label: 'Recent' },
]

type Props = {
  className?: string
  value?: string
  onChange?: (value: SortKey) => void
}

export const Select: React.FC<Props> = ({ onChange = () => {}, className }) => {
  return (
    <Wrap className={className} data-testid="select">
      <ReactSelect
        classNamePrefix="react-select"
        options={Options}
        hideSelectedOptions
        isSearchable={false}
        defaultValue={Options[0]}
        onChange={({ value }: any) => onChange(value)}
      />
    </Wrap>
  )
}

Select.displayName = 'Select'
