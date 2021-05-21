import React from 'react'

import { render, fireEvent } from '../testUtils'
import { getItems } from '../utils/mock'
import {
  TITLE_ID as ITEM_TITLE_ID,
  TRAIN_BUTTON,
  DELETE_BUTTON,
  HISTORY_BUTTON,
  GENERATE_BUTTON,
  RENAME_BUTTON,
} from './Item.spec'
import { ItemGrid } from '../components/ItemGrid'

export const ID = 'itemGrid'

describe('ItemGrid', () => {
  it('default', () => {
    const items = getItems(50)
    const { getByTestId, getAllByTestId } = render(
      <ItemGrid
        items={items}
        onRename={() => {}}
        onTrain={() => {}}
        onHistory={() => {}}
        onGenerate={() => {}}
        onDelete={() => {}}
      />,
    )

    expect(getByTestId(ID)).toBeTruthy()
    getAllByTestId(ITEM_TITLE_ID).map((elem, i) => {
      expect(elem).toHaveTextContent(items[i].name)
    })
  })

  it('onCallback', () => {
    const trainSpy = jest.fn()
    const renameSpy = jest.fn()
    const historySpy = jest.fn()
    const deleteSpy = jest.fn()
    const generateSpy = jest.fn()
    const items = getItems(50)
    const { getAllByTestId } = render(
      <ItemGrid
        items={items}
        onRename={renameSpy}
        onTrain={trainSpy}
        onHistory={historySpy}
        onGenerate={generateSpy}
        onDelete={deleteSpy}
      />,
    )

    getAllByTestId(TRAIN_BUTTON).forEach((elem) => fireEvent.click(elem))
    getAllByTestId(RENAME_BUTTON).forEach((elem) => fireEvent.click(elem))
    getAllByTestId(HISTORY_BUTTON).forEach((elem) => fireEvent.click(elem))
    getAllByTestId(GENERATE_BUTTON).forEach((elem) => fireEvent.click(elem))
    getAllByTestId(DELETE_BUTTON).forEach((elem) => fireEvent.click(elem))

    const argsItems = items.map((item) => [item.name])
    expect(trainSpy.mock.calls).toEqual(argsItems)
    expect(renameSpy.mock.calls).toEqual(argsItems)
    expect(historySpy.mock.calls).toEqual(argsItems)
    expect(deleteSpy.mock.calls).toEqual(argsItems)
    expect(generateSpy.mock.calls).toEqual(argsItems)
  })

  it('className', () => {
    const className = 'className'
    const { getByTestId } = render(
      <ItemGrid
        items={[]}
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
