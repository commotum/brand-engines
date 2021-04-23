import { NextPage } from 'next'
import React from 'react'
import styled, { css } from 'styled-components'
import { useRouter } from 'next/router'
import { Form, Formik } from 'formik'
import { number, object, string } from 'yup'

import { TopPanel } from '../components/TopPanel'
import { useGenerate } from '../utils/hooks/useGenerate'
import { InputField } from '../components/InputField'
import { Input } from '../components/Input'
import { Throbber } from '../components/Throbber'
import { Button } from '../components/common/Button'

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  max-width: 85rem;
  margin: 0 auto;
  padding: 0 1rem;
`

const SForm = styled(Form)`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 41.5rem;
  position: relative;
`

const BottomWrap = styled.div`
  gap: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const SInputField = styled(InputField)`
  width: 100%;

  textarea {
    width: 100%;
    height: 6rem;
  }
`

const Text = styled.textarea<{ visible: number }>(
  ({ theme, visible }) => css`
    resize: none;
    visibility: ${visible ? 'visible' : 'hidden'};
    font-size: ${theme.size.default};
    color: ${theme.color.black};
    text-align: left;
    width: 100%;
    height: 21.5rem;
    overflow: auto;
    border: 2px solid ${theme.color.gray};
    border-radius: ${theme.radius.default};
    margin: 3rem 0;
  `,
)

const SButton = styled(Button)`
  margin-top: 0.75rem;
  align-self: flex-end;
`

const SCHEMA = object().shape({
  text: string(),
  temperature: number().max(2.0).min(0).required(),
  topK: number().min(0).required(),
  length: number().min(0).required(),
})

const INITIAL_VALUES = {
  text: '',
  temperature: 1.0,
  topK: 0,
  length: 50,
}

type Props = {}

const Generate: NextPage<Props> = () => {
  const {
    query: { id, count },
  } = useRouter()
  const { data, isLoading, onGenerate } = useGenerate(
    id as string,
    count as string,
  )

  return (
    <Wrap>
      <TopPanel title={`${id} - Generate`} />
      <Formik
        initialValues={INITIAL_VALUES}
        validateOnChange
        validationSchema={SCHEMA}
        onSubmit={onGenerate}
      >
        <SForm data-testid="generate">
          <SInputField
            label="Prompt"
            name="text"
            placeholder="Please Enter, or leave blank for random ..."
          />
          <SButton disabled={isLoading}>Generate text</SButton>
          {isLoading && <Throbber centered />}
          <Text
            visible={Number(!isLoading && Boolean(data))}
            value={data || ''}
          />
          <BottomWrap>
            <Input
              label="Temperature 0.0-2.0:"
              name="temperature"
              type="number"
            />
            <Input label="Top K Integer:" name="topK" type="number" />
            <Input label="Generation Length:" name="length" type="number" />
          </BottomWrap>
        </SForm>
      </Formik>
    </Wrap>
  )
}

Generate.displayName = 'Generate'

export default Generate
