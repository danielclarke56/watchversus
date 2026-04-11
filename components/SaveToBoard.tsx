'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'

interface Board {
  id: string
  name: string
}

interface SaveToBoardProps {
  photoId: string
  /** 'card' shows as small icon overlay, 'button' shows as a full button */
  variant?: 'card' | 'button'
}

export default function SaveToBoard({ photoId, variant = 'card' }: SaveToBoardProps) {
  const { isSignedIn } = useAuth()
  const [open, setOpen] = useState(false)
  const [boards, setBoards] = useState<Board[]>([])
  const [savedIn, setSavedIn] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [open])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [boardsRes, savedRes] = await Promise.all([
        fetch('/api/collections'),
        fetch(`/api/photo/${photoId}/saved`),
      ])
      if (boardsRes.ok) {
        const data = await boardsRes.json()
        setBoards(data.collections.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
      }
      if (savedRes.ok) {
        const data = await savedRes.json()
        setSavedIn(new Set(data.savedIn))
      }
    } catch (err) {
      console.error('Failed to fetch boards:', err)
    } finally {
      setLoading(false)
    }
  }, [photoId])

  function handleOpen(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isSignedIn) {
      // Clerk's SignInButton would be ideal but we can redirect
      window.location.href = '/sign-in'
      return
    }
    setOpen(true)
    fetchData()
  }

  async function toggleBoard(boardId: string) {
    setToggling(boardId)
    const isSaved = savedIn.has(boardId)
    try {
      if (isSaved) {
        await fetch(`/api/collections/${boardId}/items?photoId=${photoId}`, { method: 'DELETE' })
        setSavedIn((prev) => { const next = new Set(prev); next.delete(boardId); return next })
      } else {
        await fetch(`/api/collections/${boardId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId }),
        })
        setSavedIn((prev) => new Set(prev).add(boardId))
      }
    } catch (err) {
      console.error('Failed to toggle save:', err)
    } finally {
      setToggling(null)
    }
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const data = await res.json()
        setBoards((prev) => [...prev, { id: data.id, name: data.name }])
        setNewName('')
        // Auto-save to new board
        await fetch(`/api/collections/${data.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId }),
        })
        setSavedIn((prev) => new Set(prev).add(data.id))
      }
    } catch (err) {
      console.error('Failed to create board:', err)
    } finally {
      setCreating(false)
    }
  }

  const isSavedAnywhere = savedIn.size > 0

  const bookmarkIcon = (
    <svg
      className={variant === 'card' ? 'w-5 h-5' : 'w-4 h-4'}
      fill={isSavedAnywhere ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  )

  return (
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Trigger button */}
      {variant === 'card' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSavedAnywhere
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          aria-label="Save to board"
        >
          {bookmarkIcon}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isSavedAnywhere
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {bookmarkIcon}
          {isSavedAnywhere ? 'Saved' : 'Save'}
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className={`absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-56 py-2 ${
          variant === 'card' ? 'top-10 right-0' : 'top-full mt-2 right-0'
        }`}>
          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Save to board</p>

          {loading ? (
            <div className="px-3 py-4 text-center text-sm text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto">
                {boards.map((board) => (
                  <button
                    key={board.id}
                    type="button"
                    onClick={() => toggleBoard(board.id)}
                    disabled={toggling === board.id}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      savedIn.has(board.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                    }`}>
                      {savedIn.has(board.id) && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{board.name}</span>
                  </button>
                ))}
              </div>

              {/* Create new board */}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <div className="px-3 py-1.5">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New board name..."
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-300"
                    maxLength={100}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                  />
                  {newName.trim() && (
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={creating}
                      className="mt-1.5 w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1"
                    >
                      {creating ? 'Creating...' : `Create "${newName.trim()}" & save`}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
