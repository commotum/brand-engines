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
  const [
    field,
    { error, touched },
    { setValue, setError, setTouched },
  ] = useField(name)
  const [drag, setDrag] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [filename, setFilename] = React.useState('')
  const [hasRead, setHasRead] = React.useState(false)
  const reading = React.useRef(false)
  const isError = Boolean(error && touched) ? 1 : 0

  const readFiles = async (files: File[]) => {
    if (reading.current || !files.length) {
      return
    }
    reading.current = true
    setLoading(true)
    setHasRead(false)
    setDrag(false)
    setFilename(files.map((file) => file.name).join(', '))
    setValue('')
    try {
      const contents = await Promise.all(files.map((file) => file.text()))
      await setValue(contents.join(''))
      setHasRead(true)
    } catch (error) {
      await setTouched(true, false)
      setError('Could not read the selected file. Please try again.')
    } finally {
      reading.current = false
      setLoading(false)
    }
  }

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
      setDrag(false)
      await readFiles(Array.from(ev.dataTransfer.files))
    },
    [setValue, setDrag, prevent, setLoading, loading],
  )

  const onUpload = React.useCallback(
    async (ev: React.ChangeEvent<HTMLInputElement>) => {
      prevent(ev)
      await readFiles(Array.from(ev.target.files || []))
    },
    [setValue, setDrag, prevent, setLoading, loading],
  )

  let text = 'Drag and drop or click to browse'
  if (field.value || hasRead) {
    text = filename ? `${filename} selected` : 'Training data selected'
  }
  if (loading) {
    text = `Reading ${filename}…`
  }
  if (drag && !loading) {
    text = 'Drop here'
  }

  return (
    <Wrap className={className} data-testid="fileInput">
      <SLabel htmlFor={label} isError={isError}>
        {label}
      </SLabel>
      <Field isError={isError}>
        {field.value || hasRead ? <FileImage /> : <UploadImage />}
        <UploadText role="status">{text}</UploadText>
        <SInput
          {...field}
          multiple
          disabled={loading}
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
