import React from 'react'

export const useInterval = (
  interval: number,
  fn: () => void,
  deps?: readonly any[],
) => {
  React.useEffect(() => {
    if (interval <= 0) {
      return
    }
    let timeout = setInterval(() => {
      fn()
    }, interval)
    return () => {
      if (timeout) {
        clearInterval(timeout as any)
      }
      timeout = 0
    }
  }, deps)
}
