'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'

interface BoardSummary {
  id: string
  name: string
  coverUrl: string | null
  itemCount: number
  createdAt: string
}

export default function BoardsClient() {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const fetchBoards = useCallback(async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        setBoards(data.collections)
      }
    } catch (err) {
      console.error('Failed to fetch boards:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBoards() }, [fetchBoards])

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
        setNewName('')
        setShowCreate(false)
        await fetchBoards()
      }
    } catch (err) {
      console.error('Failed to create board:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
            <p className="text-gray-600 text-sm mt-1">
              Save and organize watch photos into collections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shrink-0 text-center w-full sm:w-auto"
          >
            Create Board
          </button>
        </div>

        {/* Create board inline form */}
        {showCreate && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Board name (e.g. Wishlist, Grail Watches)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              maxLength={100}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewName('') }}
                className="text-gray-600 hover:text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <EmptyState
                icon="📋"
                title="No boards yet"
                message="Create a board to start saving watch photos you love. Browse the gallery and tap the bookmark icon to save photos."
                actionText="Create Your First Board"
                actionStyle="blue"
                onAction={() => setShowCreate(true)}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/dashboard/boards/${board.id}`}
                className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {board.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={board.coverUrl}
                      alt={board.name}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900 truncate">{board.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {board.itemCount} {board.itemCount === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
