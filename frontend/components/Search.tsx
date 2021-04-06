import React from 'react'
import styled, { css } from 'styled-components'
import { Form, Formik, Field } from 'formik'

import { AutoSave } from './AutoSave'

const SearchIcon = styled.img.attrs(({ theme }) => ({
  src: theme.images.search,
}))(
  () => css`
    position: absolute;
    right: 0.75rem;
    width: 0.875rem;
    height: 0.875rem;
    top: calc(50% - 0.4375rem);
  `,
)

const SField = styled(Field)(
  ({ theme }) => css`
    border: none;
    box-sizing: border-box;
    box-shadow: ${theme.boxShadow.default};
    color: ${theme.color.black};
    font-size: ${theme.size.default};
    border-radius: ${theme.radius.default};
    width: 100%;
    line-height: 1.6;
    padding: 0.5rem 2.75rem 0.5rem 1rem;

    :focus {
      outline: none;
    }
  `,
)

export const SForm = styled(Form)`
  position: relative;
  width: 100%;
  max-width: 18rem;
  height: auto;
`

type Props = {
  className?: string
  value?: string
  onChange?: (value: string) => void
}

export const Search: React.FC<Props> = ({
  onChange,
  value = '',
  className,
}) => {
  const onSubmit = ({ search }: { search: string }) => {
    if (onChange) {
      onChange(search)
    }
  }

  return (
    <Formik
      initialValues={{
        search: value,
      }}
      validateOnChange
      onSubmit={onSubmit}
    >
      <SForm data-testid="search" className={className}>
        <SField
          data-testid="searchInput"
          name="search"
          placeholder="Search..."
        />
        <AutoSave time={300} />
        <SearchIcon />
      </SForm>
    </Formik>
  )
}

Search.displayName = 'Search'
