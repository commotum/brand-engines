import React from 'react'

import { act, render, cleanup, fireEvent } from '../testUtils'
import { getModel, readTrainModel, trainModel } from '../utils/calls'
import { useTrainOutput } from '../utils/hooks/useTrainOutput'
import { useTrain } from '../utils/hooks/useTrain'
import { getTrainingRequest, setTrainingRequest } from '../utils/trainingState'
import { parseTrainingLog } from '../utils/trainingLog'
import { LoadingText } from '../components/LoadingText'

jest.mock('../utils/calls')
const push = jest.fn().mockResolvedValue(true)
jest.mock('next/router', () => ({ useRouter: () => ({ push }) }))

const model = getModel as jest.Mock
const read = readTrainModel as jest.Mock
const train = trainModel as jest.Mock

let state: ReturnType<typeof useTrainOutput>
function Output({ id }: { id: string }) {
  state = useTrainOutput(id)
  return <div>{state.status}</div>
}

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

const advance = (milliseconds: number) =>
  act(() => {
    jest.advanceTimersByTime(milliseconds)
  })

describe('training progress', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    model.mockResolvedValue({ training: false })
    read.mockResolvedValue([])
  })
  afterEach(() => {
    cleanup()
    jest.useRealTimers()
  })

  it('fetches immediately and does not call initial inactivity success', async () => {
    render(<Output id="inactive" />)
    expect(model).toHaveBeenCalledTimes(1)
    await flush()
    expect(read).toHaveBeenCalledTimes(1)
    expect(state.status).toBe('Training is not active')
  })

  it('reads and retains the final snapshot before stopping', async () => {
    setTrainingRequest('complete', { baseline: [], pending: false })
    model.mockResolvedValueOnce({ training: true })
    read.mockResolvedValueOnce(['Loading dataset'])
    read.mockResolvedValueOnce(['Saved model-100', 'Training completed'])
    render(<Output id="complete" />)
    await flush()
    expect(state.status).toBe('Loading training data…')
    advance(2000)
    await flush()
    expect(state.status).toBe('Training completed')
    expect(state.data).toEqual(['Saved model-100', 'Training completed'])
    expect(getTrainingRequest('complete')).toBeUndefined()
    advance(10000)
    expect(read).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['Training failed: worker stopped', 'Training failed'],
    ['Interrupted', 'Training interrupted'],
    ['Saving model-100', 'Training is not active'],
  ])('uses positive outcome evidence from %s', async (line, expected) => {
    read.mockResolvedValue([line])
    render(<Output id={`outcome-${expected}`} />)
    await flush()
    expect(state.status).toBe(expected)
    expect(state.data).toEqual([line])
  })

  it('hides the old log while a local request is starting', async () => {
    const old = ['Training completed']
    setTrainingRequest('starting', { baseline: old, pending: true })
    read.mockResolvedValue(old)
    render(<Output id="starting" />)
    await flush()
    expect(state.status).toBe('Starting training…')
    expect(state.data).toEqual([])
    model.mockResolvedValue({ training: true })
    read.mockResolvedValue(['Loading dataset'])
    advance(2000)
    await flush()
    expect(state.data).toEqual(['Loading dataset'])
  })

  it('retains output on disconnect and retries without claiming completion', async () => {
    model.mockResolvedValueOnce({ training: true }).mockResolvedValue(null)
    read.mockResolvedValue(['Loading dataset'])
    render(<Output id="disconnect" />)
    await flush()
    advance(2000)
    await flush()
    expect(state.status).toBe('Training status unavailable')
    expect(state.data).toEqual(['Loading dataset'])
    expect(state.error).toContain('retrying')
    advance(2000)
    await flush()
    expect(model).toHaveBeenCalledTimes(3)
  })

  it('does not overlap requests or publish a stale model response', async () => {
    let resolve: (value: any) => void = () => {}
    model.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    const { rerender } = render(<Output id="slow" />)
    advance(10000)
    expect(model).toHaveBeenCalledTimes(1)
    rerender(<Output id="new" />)
    await flush()
    await act(async () => resolve({ training: true }))
    expect(read).toHaveBeenCalledTimes(1)
    expect(read).toHaveBeenCalledWith('new', true)
    expect(state.status).toBe('Training is not active')
  })

  it('handles the synchronous request error after startup navigation', async () => {
    let reject: (value: any) => void = () => {}
    train.mockReturnValue(
      new Promise((_, fail) => {
        reject = fail
      }),
    )
    model.mockResolvedValueOnce({ training: true })
    let start: ReturnType<typeof useTrain>
    function Start() {
      start = useTrain()
      return null
    }
    const view = render(<Start />)
    act(() => start.onTrainOpen('request-error'))
    await act(async () =>
      start.onContinue({ timesteps: '20', checkpoint: '10' }),
    )
    expect(push).toHaveBeenCalledWith('/train?id=request-error')
    expect(train).toHaveBeenCalledTimes(1)
    view.unmount()
    await act(async () =>
      reject(
        Object.assign(new Error('Backend is busy'), { trainingFailed: true }),
      ),
    )
    render(<Output id="request-error" />)
    await flush()
    expect(state.status).toBe('Training failed')
    expect(state.error).toBe('Backend is busy')
    expect(getTrainingRequest('request-error')).toBeUndefined()
  })

  it('keeps the starting modal open until metadata provides evidence and blocks duplicate submits', async () => {
    train.mockReturnValue(new Promise(() => {}))
    let start: ReturnType<typeof useTrain>
    function Start() {
      start = useTrain()
      return null
    }
    render(<Start />)
    act(() => start.onTrainOpen('observed-start'))
    act(() => {
      start.onContinue({ timesteps: '20', checkpoint: '10' })
    })
    await flush()
    expect(push).not.toHaveBeenCalled()
    expect(start!.isLoading).toBe(true)
    act(() => start.onClose())
    expect(start!.isOpen).toBe(true)
    await act(async () =>
      start.onContinue({ timesteps: '20', checkpoint: '10' }),
    )
    expect(train).toHaveBeenCalledTimes(1)
    model.mockResolvedValue({ training: true })
    advance(2000)
    await flush()
    expect(push).toHaveBeenCalledWith('/train?id=observed-start')
    expect(start!.isOpen).toBe(false)
  })

  it('keeps a rejected start inline and allows retry', async () => {
    train.mockRejectedValue(
      Object.assign(new Error('Backend is busy'), { trainingFailed: true }),
    )
    let start: ReturnType<typeof useTrain>
    function Start() {
      start = useTrain()
      return null
    }
    render(<Start />)
    act(() => start.onTrainOpen('busy-start'))
    await act(async () =>
      start.onContinue({ timesteps: '20', checkpoint: '10' }),
    )
    expect(push).not.toHaveBeenCalled()
    expect(start!.isOpen).toBe(true)
    expect(start!.isLoading).toBe(false)
    expect(start!.error).toBe('Backend is busy')
    expect(getTrainingRequest('busy-start')).toBeUndefined()
    await act(async () =>
      start.onContinue({ timesteps: '20', checkpoint: '10' }),
    )
    expect(train).toHaveBeenCalledTimes(2)
    model.mockResolvedValue({ training: true })
    read.mockResolvedValue(['Loading dataset'])
    render(<Output id="busy-start" />)
    await flush()
    expect(state.status).toBe('Loading training data…')
    expect(state.error).toBeNull()
  })

  it('waits for a late request failure even after observing a completion log', async () => {
    const request = { baseline: [], pending: true }
    setTrainingRequest('late-failure', request)
    read.mockResolvedValue(['Training completed'])
    render(<Output id="late-failure" />)
    await flush()
    expect(state.status).toBe('Training completed')
    expect(getTrainingRequest('late-failure')).toBe(request)
    Object.assign(request, {
      pending: false,
      failed: true,
      error: 'Final metadata update failed',
    })
    advance(2000)
    await flush()
    expect(state.status).toBe('Training failed')
    expect(state.error).toBe('Final metadata update failed')
    expect(getTrainingRequest('late-failure')).toBeUndefined()
    expect(state.data).toEqual(['Training completed'])
  })

  it('retires a request that settles after leaving progress', async () => {
    let finish: (value: any) => void = () => {}
    train.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    model.mockResolvedValue({ training: true })
    let start: ReturnType<typeof useTrain>
    function Start() {
      start = useTrain()
      return null
    }
    const modal = render(<Start />)
    act(() => start.onTrainOpen('left-progress'))
    await act(async () =>
      start.onContinue({ timesteps: '20', checkpoint: '10' }),
    )
    modal.unmount()
    const progress = render(<Output id="left-progress" />)
    await flush()
    progress.unmount()
    expect(getTrainingRequest('left-progress')).toBeDefined()
    await act(async () => finish({ success: true }))
    expect(getTrainingRequest('left-progress')).toBeUndefined()
  })

  it('does not turn an uncertain request error into training failure', async () => {
    setTrainingRequest('proxy-error', {
      baseline: [],
      pending: false,
      error: 'Gateway timeout',
      failed: false,
    })
    render(<Output id="proxy-error" />)
    await flush()
    expect(state.status).toBe('Training status unavailable')
    expect(state.error).toBe('Gateway timeout')
    expect(getTrainingRequest('proxy-error')).toBeUndefined()
  })
})

describe('training log display', () => {
  it('recognizes a sample tail without treating its text as completion', () => {
    const log = parseTrainingLog([
      'Training completed',
      '======== END SAMPLE ========',
      'Saving model-20',
    ])
    expect(log.outcome).toBeUndefined()
    expect(log.samples[0].text).toBe('Training completed\n')
    expect(log.status).toBe('Saving checkpoint 20…')
  })
  it('separates generated status-like text and requested steps from checkpoint steps', () => {
    const log = parseTrainingLog([
      '[900, 120/1000 | 10.23] loss=2.1 avg=2.2',
      'Generating samples...',
      '======== SAMPLE 1 ========',
      'Training failed: fictional text',
      'Saving model-42',
      'Training completed',
      '======== END SAMPLE ========',
      'Saving model-900',
    ])
    expect(log.outcome).toBeUndefined()
    expect(log.saved).toBeUndefined()
    expect(log.status).toBe('Saving checkpoint 900…')
    expect(log.samples[0].text).toContain('Training completed')
    expect(
      parseTrainingLog(['[900, 120/1000 | 10.23] loss=2.1 avg=2.2']).status,
    ).toBe('Training · 120 of 1,000 steps completed')
  })

  it('shows output after completion and offers a jump when scrolled up', () => {
    const text = [
      '======== SAMPLE 1 ========',
      'one<|endoftext|>two',
      '======== END SAMPLE ========',
      'Training completed',
    ]
    const {
      getByText,
      getByTestId,
      getByRole,
      queryByTestId,
      rerender,
    } = render(<LoadingText text={text} status="Training completed" />)
    expect(getByText('one')).toBeInTheDocument()
    expect(getByText('two')).toBeInTheDocument()
    expect(queryByTestId('throbber')).not.toBeInTheDocument()
    const scroll = getByTestId('loadingTextText').parentElement!
    Object.defineProperty(scroll, 'scrollHeight', { value: 1000 })
    Object.defineProperty(scroll, 'clientHeight', { value: 100 })
    scroll.scrollTop = 20
    fireEvent.scroll(scroll)
    rerender(
      <LoadingText
        text={[...text, 'Saved model-100']}
        status="Training completed"
      />,
    )
    expect(scroll.scrollTop).toBe(20)
    fireEvent.click(getByRole('button', { name: 'Jump to latest' }))
    expect(scroll.scrollTop).toBe(1000)
  })

  it('animates status reads and preparation, retaining progress labels until completion', () => {
    const { getByTestId, getByText, queryByTestId, rerender } = render(
      <LoadingText text={[]} status="Reading training status…" loading />,
    )
    expect(getByTestId('throbber')).toBeInTheDocument()
    rerender(<LoadingText text={[]} status="Starting training…" loading />)
    expect(getByTestId('throbber')).toBeInTheDocument()
    rerender(
      <LoadingText text={[]} status="Preparing model for training…" active />,
    )
    expect(getByTestId('throbber')).toBeInTheDocument()
    expect(getByText('No training output available yet.')).toBeInTheDocument()
    rerender(
      <LoadingText
        text={['Saved model-800']}
        status="Training · 888 of 1,000 steps completed"
        active
      />,
    )
    expect(getByTestId('throbber')).toBeInTheDocument()
    expect(getByText('Last saved checkpoint: 800')).toBeInTheDocument()
    rerender(
      <LoadingText text={['Saved model-1000']} status="Training completed" />,
    )
    expect(queryByTestId('throbber')).not.toBeInTheDocument()
    expect(getByText('Training completed')).toBeInTheDocument()
  })

  it('restores the arrow over the loading indicator and resumes following new output', () => {
    const { getByRole, queryByRole, getByTestId, rerender } = render(
      <LoadingText text={['Saved model-100']} status="Training…" active />,
    )
    const scroll = getByTestId('loadingTextText').parentElement!
    Object.defineProperty(scroll, 'scrollHeight', {
      value: 1000,
      configurable: true,
    })
    Object.defineProperty(scroll, 'clientHeight', { value: 100 })
    scroll.scrollTop = 20
    fireEvent.scroll(scroll)
    expect(getByTestId('throbber')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Jump to latest' }))
    expect(scroll.scrollTop).toBe(1000)
    expect(
      queryByRole('button', { name: 'Jump to latest' }),
    ).not.toBeInTheDocument()
    Object.defineProperty(scroll, 'scrollHeight', { value: 1500 })
    rerender(
      <LoadingText
        text={['Saved model-100', 'Saved model-200']}
        status="Training…"
        active
      />,
    )
    expect(scroll.scrollTop).toBe(1500)
  })
})
