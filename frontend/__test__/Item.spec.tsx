import React from 'react'

import { render, fireEvent } from '../testUtils'
import { Item } from '../components/Item'

export const ID = 'item'
export const TITLE_ID = 'itemTitle'
export const TRAIN_BUTTON = 'itemButtonTrain'
export const GENERATE_BUTTON = 'itemButtonGenerate'
export const HISTORY_BUTTON = 'itemButtonHistory'
export const RENAME_BUTTON = 'itemButtonRename'
export const DELETE_BUTTON = 'itemButtonDelete'

describe('Item', () => {
  it('default', () => {
    const title = 'Title'
    const { getByTestId } = render(
      <Item
        title={title}
        onRename={() => {}}
        onTrain={() => {}}
        onHistory={() => {}}
        onGenerate={() => {}}
        onDelete={() => {}}
      />,
    )

    expect(getByTestId(ID)).toBeTruthy()
    expect(getByTestId(TITLE_ID)).toHaveTextContent(title)
    expect(getByTestId(TITLE_ID)).toHaveStyle('opacity: 1')
  })

  it('onTrain', () => {
    const title = 'Title'
    const trainSpy = jest.fn()
    const renameSpy = jest.fn()
    const historySpy = jest.fn()
    const deleteSpy = jest.fn()
    const generateSpy = jest.fn()
    const { getByTestId } = render(
      <Item
        title={title}
        onRename={renameSpy}
        onTrain={trainSpy}
        onHistory={historySpy}
        onGenerate={generateSpy}
        onDelete={deleteSpy}
      />,
    )

    fireEvent.click(getByTestId(TRAIN_BUTTON))
    expect(trainSpy).toHaveBeenCalledTimes(1)
    expect(historySpy).toHaveBeenCalledTimes(0)
    expect(renameSpy).toHaveBeenCalledTimes(0)
    expect(generateSpy).toHaveBeenCalledTimes(0)
    expect(deleteSpy).toHaveBeenCalledTimes(0)
  })

  it('onRename', () => {
    const title = 'Title'
    const trainSpy = jest.fn()
    const renameSpy = jest.fn()
    const historySpy = jest.fn()
    const deleteSpy = jest.fn()
    const generateSpy = jest.fn()
    const { getByTestId } = render(
      <Item
        title={title}
        onRename={renameSpy}
        onTrain={trainSpy}
        onHistory={historySpy}
        onGenerate={generateSpy}
        onDelete={deleteSpy}
      />,
    )

    fireEvent.click(getByTestId(RENAME_BUTTON))
    expect(trainSpy).toHaveBeenCalledTimes(0)
    expect(historySpy).toHaveBeenCalledTimes(0)
    expect(renameSpy).toHaveBeenCalledTimes(1)
    expect(generateSpy).toHaveBeenCalledTimes(0)
    expect(deleteSpy).toHaveBeenCalledTimes(0)
  })

  it('onGenerate', () => {
    const title = 'Title'
    const trainSpy = jest.fn()
    const renameSpy = jest.fn()
    const historySpy = jest.fn()
    const deleteSpy = jest.fn()
    const generateSpy = jest.fn()
    const { getByTestId } = render(
      <Item
        title={title}
        onRename={renameSpy}
        onTrain={trainSpy}
        onHistory={historySpy}
        onGenerate={generateSpy}
        onDelete={deleteSpy}
      />,
    )

    fireEvent.click(getByTestId(GENERATE_BUTTON))
    expect(trainSpy).toHaveBeenCalledTimes(0)
    expect(historySpy).toHaveBeenCalledTimes(0)
    expect(renameSpy).toHaveBeenCalledTimes(0)
    expect(generateSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledTimes(0)
  })

  it('onHistory', () => {
    const title = 'Title'
    const trainSpy = jest.fn()
    const renameSpy = jest.fn()
    const historySpy = jest.fn()
    const deleteSpy = jest.fn()
    const generateSpy = jest.fn()
    const { getByTestId } = render(
      <Item
        title={title}
        onRename={renameSpy}
        onTrain={trainSpy}
        onHistory={historySpy}
        onGenerate={generateSpy}
        onDelete={deleteSpy}
      />,
    )

    fireEvent.click(getByTestId(HISTORY_BUTTON))
    expect(trainSpy).toHaveBeenCalledTimes(0)
    expect(historySpy).toHaveBeenCalledTimes(1)
    expect(renameSpy).toHaveBeenCalledTimes(0)
    expect(generateSpy).toHaveBeenCalledTimes(0)
    expect(deleteSpy).toHaveBeenCalledTimes(0)
  })

  it('onDelete', () => {
    const title = 'Title'
    const trainSpy = jest.fn()
    const renameSpy = jest.fn()
    const historySpy = jest.fn()
    const deleteSpy = jest.fn()
    const generateSpy = jest.fn()
    const { getByTestId } = render(
      <Item
        title={title}
        onRename={renameSpy}
        onTrain={trainSpy}
        onHistory={historySpy}
        onGenerate={generateSpy}
        onDelete={deleteSpy}
      />,
    )

    fireEvent.click(getByTestId(DELETE_BUTTON))
    expect(trainSpy).toHaveBeenCalledTimes(0)
    expect(historySpy).toHaveBeenCalledTimes(0)
    expect(renameSpy).toHaveBeenCalledTimes(0)
    expect(generateSpy).toHaveBeenCalledTimes(0)
    expect(deleteSpy).toHaveBeenCalledTimes(1)
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <Item
        title="Title"
        onRename={() => {}}
        onTrain={() => {}}
        onHistory={() => {}}
        onGenerate={() => {}}
        onDelete={() => {}}
        className={className}
      />,
    )
    expect(getByTestId(ID).className.includes(className)).toBeTruthy()
  })
})
