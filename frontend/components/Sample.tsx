import React from 'react'
import styled, { css } from 'styled-components'

const Wrap = styled.div`
  height: auto;
  position: relative;
`

const InnerWrap = styled.div<{ selected: number }>(
  ({ selected }) => css`
    overflow: hidden;
    position: relative;
    margin-left: 3.75rem;
    transition: 500ms max-height ease-in-out;
    height: ${selected ? 'min-content' : 0};
  `,
)

const Chevron = styled.img.attrs(({ theme }) => ({
  src: theme.images.chevronRight,
}))<{ selected?: number }>(
  ({ selected }) => css`
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.25rem;
    transition: 200ms transform;
    transform: rotate(${selected ? `90deg` : 0});
  `,
)

const SampleIcon = styled.img.attrs(({ theme }) => ({
  src: theme.images.sample,
}))(
  () => css`
    width: 1.5rem;
    height: auto;
    margin-right: 0.75rem;
  `,
)

const SmallSampleIcon = styled(SampleIcon)`
  width: 1.125rem;
  margin-right: 0.625rem;
`

const TitleButton = styled.button(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    border-radius: ${theme.radius.default};
    background-color: transparent;
    border: 0.125rem solid transparent;
    box-shadow: none;
    cursor: pointer;
    color: ${theme.color.medium};
    font-weight: 500;
    font-size: ${theme.size.default};
    height: 1.875rem;
    transition: 300ms height ease-out;

    :focus,
    :active {
      border-color: ${theme.color.black};
      outline: none;
    }

    :disabled {
      padding-top: 0;
      padding-bottom: 0;
      margin: 0 0.125rem;
      height: 0;
      border: none;
    }
  `,
)

const SampleTitle = styled.p(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    color: ${theme.color.medium};
    font-weight: 500;
    font-size: ${theme.size.default};
  `,
)

const SampleText = styled.pre(
  ({ theme }) => css`
    margin-left: 3.25rem;
    white-space: break-spaces;
    color: ${theme.color.medium};
    font-weight: 500;
    font-size: ${theme.size.default};
  `,
)

type Props = {
  title: string
  samples: string[]
  disabled?: boolean
  className?: string
}

export const Sample: React.FC<Props> = ({
  samples,
  disabled = false,
  className,
  title,
}) => {
  const [selected, setSelected] = React.useState(false)

  React.useEffect(() => {
    setSelected(false)
  }, [disabled])
  return (
    <Wrap className={className} data-testid="sample">
      <TitleButton
        disabled={disabled}
        data-testid="sampleTitle"
        onClick={() => {
          setSelected((prev) => !prev)
        }}
      >
        <Chevron selected={Number(!disabled && selected)} />
        <SampleIcon />
        {title}
      </TitleButton>
      <InnerWrap
        data-testid="sampleCollapse"
        selected={Number(!disabled && selected)}
      >
        {samples.map((item, i) => (
          <React.Fragment key={`sample-${i}`}>
            <SampleTitle>
              <SmallSampleIcon />
              Sample {i + 1}
            </SampleTitle>
            <SampleText data-testid="sampleText">{item}</SampleText>
          </React.Fragment>
        ))}
      </InnerWrap>
    </Wrap>
  )
}

Sample.displayName = 'Sample'
