import React from 'react'
import { useField } from 'formik'
import styled, { css } from 'styled-components'

const Wrap = styled.div`
  position: relative;
  width: 100%;
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
    font-weight: bold;
    position: absolute;
    bottom: -0.8125rem;
    text-align: right;
    width: 100%;
  `,
)

const Field = styled.div<{ isError?: number }>(
  ({ theme, isError }) => css`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.5rem;
    width: 100%;
    height: 10.625rem;
    flex-direction: column;
    border: 0.125rem solid ${isError ? theme.color.red : theme.color.gray};
    padding: 1rem;
    color: ${theme.color.black};
    font-size: ${theme.size.default};
    border-radius: ${theme.radius.medium};

    :focus-within {
      border-color: ${theme.color.black};
    }
  `,
)

const FileImage = styled.img.attrs(({ theme }) => ({
  src: theme.images.file,
}))(
  () => css`
    width: 2.625rem;
    height: auto;
    margin-bottom: 1rem;
  `,
)

const UploadImage = styled.img.attrs(({ theme }) => ({
  src: theme.images.upload,
}))(
  () => css`
    width: 2.625rem;
    height: auto;
    margin-bottom: 1rem;
  `,
)

const UploadText = styled.h4(
  ({ theme }) => css`
    margin: 0;
    color: ${theme.color.medium};
    font-size: ${theme.size.small};
    font-weight: 600;
  `,
)

const SInput = styled.input<{ isError?: number }>(
  ({ theme, isError }) => css`
    position: absolute;
    opacity: 0;
    left: 0;
    cursor: pointer;
    top: 0;
    width: 100%;
    height: 100%;
  `,
)

type Props = {
  label: string
  name: string
  className?: string
}

export const FileInput: React.FC<Props> = ({ className, name, label }) => {
  const [field, { error, touched }, { setValue }] = useField(name)
  const [drag, setDrag] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const isError = Boolean(error && touched) ? 1 : 0

  const prevent = (
    e: React.DragEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDragEnter = React.useCallback(
    (ev: React.DragEvent<HTMLInputElement>) => {
      prevent(ev)
      setDrag(true)
    },
    [setDrag],
  )

  const onDragLeave = React.useCallback(
    (ev: React.DragEvent<HTMLInputElement>) => {
      prevent(ev)
      setDrag(false)
    },
    [setDrag],
  )

  const onDrop = React.useCallback(
    async (ev: React.DragEvent<HTMLInputElement>) => {
      prevent(ev)
      if (loading) {
        return
      }
      setDrag(false)
      setLoading(true)

      if (
        (ev as React.DragEvent<HTMLInputElement>).dataTransfer &&
        (ev as React.DragEvent<HTMLInputElement>).dataTransfer.items
      ) {
        const dataTransfer = (ev as React.DragEvent<HTMLInputElement>)
          .dataTransfer.items[0]
        if (dataTransfer.kind === 'file') {
          const file = dataTransfer.getAsFile()
          setValue(await file?.text())
        }
      }

      setLoading(false)
    },
    [setValue, setDrag, prevent, setLoading, loading],
  )

  const onUpload = React.useCallback(
    async (ev: React.ChangeEvent<HTMLInputElement>) => {
      prevent(ev)
      if (loading) {
        return
      }
      setLoading(true)
      setDrag(false)

      const { files } = ev.target
      if (files) {
        let text = ''
        for (let i = 0; i < files.length; i += 1) {
          const file = files[0]
          text += await file.text()
        }
        setValue(text)
      }
      setLoading(false)
    },
    [setValue, setDrag, prevent, setLoading, loading],
  )

  let text = 'Drag and drop or click to browse'
  if (field.value) {
    text = 'Uploaded!'
  }
  if (loading) {
    text = 'Uploading...'
  }
  if (drag) {
    text = 'Drop here'
  }

  return (
    <Wrap className={className} data-testid="fileInput">
      <SLabel htmlFor={label} isError={isError}>
        {label}
      </SLabel>
      <Field isError={isError}>
        {field.value ? <FileImage /> : <UploadImage />}
        <UploadText>{text}</UploadText>
        <SInput
          {...field}
          multiple
          value={undefined}
          id={label}
          data-testid="fileInputField"
          onDragEnter={onDragEnter}
          onDragOver={prevent}
          onDrop={onDrop}
          onDragLeave={onDragLeave}
          onChange={onUpload}
          type={'file'}
        />
      </Field>
      {isError ? <Error data-testid="fileInputError">{error}</Error> : null}
    </Wrap>
  )
}
FileInput.displayName = 'FileInput'
