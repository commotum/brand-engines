import React from 'react'
import styled, { css } from 'styled-components'

export const Title = styled.h5(
  ({ theme }) => css`
    color: ${theme.color.black};
    font-size: ${theme.size.normal};
    font-weight: bold;
    line-height: 1;
    opacity: 1;
    margin: 0;
    cursor: default;
  `,
)

export const ControlWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  padding: 0 2rem;
  width: 100%;
  height: 100%;
  display: none;
  justify-content: space-between;
  align-items: center;
`

const Input = styled.input(
  ({ theme }) => css`
    position: absolute;
    top: 0;
    width: auto;
    height: 100%;
    box-shadow: none;
    background-color: transparent;
    opacity: 0;
    left: 50%;
    cursor: pointer;
    transform: translateX(-50%);
    font-weight: bold;
    color: ${theme.color.black};
    border: 0.125rem solid transparent;
    border-radius: ${theme.radius.default};
    padding: 0 0.25rem;
    transition: 300ms opacity;
    overflow: visible;
    font-size: 0.75rem;

    :focus {
      border-color: ${theme.color.black};
      outline: none;
    }

    :disabled {
      color: ${theme.color.gray};
      cursor: default;
    }
  `,
)

export const Image = styled.img<{ disabled?: boolean }>(
  ({ disabled }) => css`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: ${disabled ? 0.3 : 1};
    transition: 300ms opacity;
  `,
)

export const TrainImage = styled(Image).attrs(({ theme }) => ({
  src: theme.images.weight,
}))(() => css``)

export const GenerateImage = styled(Image).attrs(({ theme }) => ({
  src: theme.images.generate,
}))(() => css``)

export const HistoryImage = styled(Image).attrs(({ theme }) => ({
  src: theme.images.history,
}))(() => css``)

export const RenameImage = styled(Image).attrs(({ theme }) => ({
  src: theme.images.rename,
}))(() => css``)

export const DeleteImage = styled(Image).attrs(({ theme }) => ({
  src: theme.images.delete,
}))(() => css``)

export const Container = styled.div`
  width: 2rem;
  height: 2rem;
  position: relative;
  :hover,
  :focus-within {
    ${Image} {
      opacity: 0;
    }
    ${Input} {
      opacity: 1;
    }
  }
`

export const HiddenInput = styled.input`
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
  height: 100%;
  width: 100%;
`

export const SForm = styled.form(
  ({ theme }) => css`
    position: relative;
    box-shadow: ${theme.boxShadow.medium};
    border-radius: ${theme.radius.bigger};
    padding: 2rem;
    width: 100%;
    height: auto;

    :focus-within,
    :hover {
      ${Title} {
        opacity: 0;
      }
      ${ControlWrap} {
        display: flex;
      }
    }

    @media only screen and (max-width: ${theme.screenWidth.screen}) {
      max-width: 100%;
    }
  `,
)

type Props = {
  className?: string
  onTrain?(): void
  onGenerate?(): void
  onRename?(): void
  onDelete?(): void
  onHistory?(): void
  title: string
}

export const Item: React.FC<Props> = ({
  onTrain,
  onDelete,
  onGenerate,
  onHistory,
  onRename,
  title,
  className,
}) => {
  return (
    <SForm data-testid="item" className={className}>
      <HiddenInput />
      <Title data-testid="itemTitle">{title}</Title>
      <ControlWrap>
        <Container>
          <TrainImage disabled={!Boolean(onTrain)} />
          <Input
            disabled={!Boolean(onTrain)}
            data-testid="itemButtonTrain"
            onClick={onTrain}
            type="button"
            value="Train"
          />
        </Container>
        <Container>
          <GenerateImage disabled={!Boolean(onGenerate)} />
          <Input
            disabled={!Boolean(onGenerate)}
            data-testid="itemButtonGenerate"
            onClick={onGenerate}
            type="button"
            value="Generate"
          />
        </Container>
        <Container>
          <HistoryImage disabled={!Boolean(onHistory)} />
          <Input
            disabled={!Boolean(onHistory)}
            data-testid="itemButtonHistory"
            onClick={onHistory}
            type="button"
            value="History"
          />
        </Container>
        <Container>
          <RenameImage disabled={!Boolean(onRename)} />
          <Input
            disabled={!Boolean(onRename)}
            data-testid="itemButtonRename"
            onClick={onRename}
            type="button"
            value="Rename"
          />
        </Container>
        <Container>
          <DeleteImage disabled={!Boolean(onDelete)} />
          <Input
            disabled={!Boolean(onDelete)}
            data-testid="itemButtonDelete"
            onClick={onDelete}
            type="button"
            value="Delete"
          />
        </Container>
      </ControlWrap>
    </SForm>
  )
}

Item.displayName = 'Item'
