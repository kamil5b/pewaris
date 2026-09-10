import { useEffect } from 'react'
import { useCanvasStore } from '../store/canvas-store'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'Escape') {
        useCanvasStore.getState().select([])
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedIds } = useCanvasStore.getState()
        if (selectedIds.length > 0) {
          // Delete functionality would go here
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
