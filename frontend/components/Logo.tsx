import styled, { css } from 'styled-components'

export const Logo = styled.img.attrs(({ theme }) => ({
  src: theme.images.logo,
}))(
  () => css`
    width: 3.75rem;
    height: auto;
  `,
)
