import React from 'react'
import styled, { css } from 'styled-components'

import { Logo } from './Logo'
import { Select } from './Select'
import { Search } from './Search'
import { ROUTES } from '../utils/constants'
import { SortKey } from '../@types/types'

const Wrap = styled.div(
  ({ theme }) => css`
    padding: 4rem 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @media only screen and (max-width: ${theme.screenWidth.tablet}) {
      width: calc(100% - 1rem);
      padding: 1rem 0;
      flex-direction: column-reverse;
    }
  `,
)

const BackIcon = styled.img.attrs(({ theme }) => ({
  src: theme.images.chevronLeft,
}))(
  () => css`
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.5rem;
  `,
)

const Title = styled.h1(
  ({ theme }) => css`
    margin: 0.5rem;
    color: ${theme.color.black};
    font-weight: 600;
    font-size: ${theme.size.normal};
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    flex: none;

    @media only screen and (max-width: ${theme.screenWidth.screen}) {
      position: relative;
      left: auto;
      transform: none;
    }

    @media only screen and (max-width: ${theme.screenWidth.tablet}) {
      order: 1;
    }
  `,
)

const Back = styled.a(
  ({ theme }) => css`
    font-weight: 600;
    text-decoration: none;
    color: ${theme.color.medium};
    font-size: ${theme.size.normal};
    background-color: transparent;
    display: flex;
    align-items: center;
    padding: 0.25rem;
    border: 0.125rem solid transparent;
    border-radius: ${theme.radius.default};

    :hover {
      text-decoration: underline;
    }

    :focus,
    :active {
      border-color: ${theme.color.black};
      outline: none;
    }
  `,
)

const SLogo = styled(Logo)(
  ({ theme }) => css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    flex: none;
    margin: 0 0.5rem 0.5rem;

    @media only screen and (max-width: ${theme.screenWidth.screen}) {
      position: relative;
      left: auto;
      transform: none;
    }

    @media only screen and (max-width: ${theme.screenWidth.tablet}) {
      order: 1;
    }
  `,
)

const SSelect = styled(Select)`
  margin-bottom: 1rem;
`

type Props = {
  title?: string
  onSearch?: (value: string) => void
  onSort?: (value: SortKey) => void
  className?: string
}

export const TopPanel: React.FC<Props> = ({
  onSort,
  onSearch,
  className,
  title,
}) => {
  if (title) {
    return (
      <Wrap className={className} data-testid="topPanel">
        <Back data-testid="topPanelBack" href={ROUTES.home}>
          <BackIcon />
          Back to Projects
        </Back>
        <Title data-testid="topPanelTitle">{title}</Title>
        <Logo />
      </Wrap>
    )
  }
  return (
    <Wrap className={className} data-testid="topPanel">
      <Search onChange={onSearch} />
      <SLogo />
      <SSelect onChange={onSort} />
    </Wrap>
  )
}

TopPanel.displayName = 'TopPanel'
