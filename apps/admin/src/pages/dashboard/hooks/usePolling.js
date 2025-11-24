import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for polling data at regular intervals
 * @param {Function} callback - Function to call on each poll
 * @param {number} interval - Polling interval in milliseconds (default: 15000)
 * @param {boolean} enabled - Whether polling is enabled
 */
export function usePolling(callback, interval = 15000, enabled = true) {
  const [isPolling, setIsPolling] = useState(enabled)
  const savedCallback = useRef()
  const intervalId = useRef()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    if (!isPolling || !enabled) {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
      return
    }

    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    intervalId.current = setInterval(tick, interval)

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
      }
    }
  }, [interval, isPolling, enabled])

  const pausePolling = () => setIsPolling(false)
  const resumePolling = () => setIsPolling(true)
  const togglePolling = () => setIsPolling((prev) => !prev)

  return {
    isPolling,
    pausePolling,
    resumePolling,
    togglePolling,
  }
}
