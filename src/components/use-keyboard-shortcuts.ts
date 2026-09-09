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

      if (e.key === '1') {
        useCanvasStore.getState().setTool('SELECT')
      }
      if (e.key === '2') {
        useCanvasStore.getState().setTool('HAND')
      }
      if (e.key === '3') {
        useCanvasStore.getState().setTool('CONNECT')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
