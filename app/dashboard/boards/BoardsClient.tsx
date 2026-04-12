'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import EmptyState from '@/components/ui/EmptyState'

interface LikedStats {
  count: number
  coverUrl: string | null
}

interface BoardSummary {
  id: string
  name: string
  coverUrl: string | null
  itemCount: number
  createdAt: string
}

const SUGGESTED_BOARDS = [
  'Wishlist',
  'Grail Watches',
  'Daily Beaters',
  'Dress Watches',
  'Dive Collection',
  'Vintage Finds',
]

export default function CollectionsClient() {
  const [boards, setBoards] = useState<BoardSummary[]>([])
  const [liked, setLiked] = useState<LikedStats>({ count: 0, coverUrl: null })
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameName, setRenameName] = useState('')
  const [saving, setSaving] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const fetchCollections = useCallback(async () => {
    try {
      const [colRes, likedRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/user/liked'),
      ])
      if (colRes.ok) {
        const data = await colRes.json()
        setBoards(data.collections)
      }
      if (likedRes.ok) {
        const data = await likedRes.json()
        const photos = data.photos || []
        setLiked({
          count: photos.length,
          coverUrl: photos[0]?.thumbnailUrl || photos[0]?.url || null,
        })
      }
    } catch (err) {
      console.error('Failed to fetch collections:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCollections() }, [fetchCollections])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null)
      }
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [menuOpen])

  async function handleCreate(name?: string) {
    const boardName = (name || newName).trim()
    if (!boardName) return
    setCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: boardName }),
      })
      if (res.ok) {
        setNewName('')
        setShowCreate(false)
        await fetchCollections()
      }
    } catch (err) {
      console.error('Failed to create board:', err)
    } finally {
      setCreating(false)
    }
  }

  async function handleRename(boardId: string) {
    const name = renameName.trim()
    if (!name) return
    setSaving(true)
    try {
      const res = await fetch(`/api/collections/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setBoards((prev) => prev.map((b) => b.id === boardId ? { ...b, name } : b))
        setRenaming(null)
      }
    } catch (err) {
      console.error('Failed to rename:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(boardId: string) {
    if (!confirm('Delete this collection? Photos won\'t be deleted, only removed from the collection.')) return
    try {
      await fetch(`/api/collections/${boardId}`, { method: 'DELETE' })
      setBoards((prev) => prev.filter((b) => b.id !== boardId))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const existingNames = new Set(boards.map((b) => b.name.toLowerCase()))
  const availableSuggestions = SUGGESTED_BOARDS.filter((s) => !existingNames.has(s.toLowerCase()))

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600 text-sm mt-1">
              Save and organize watch photos into collections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shrink-0 text-center w-full sm:w-auto"
          >
            Create Collection
          </button>
        </div>

        {/* Create board inline form */}
        {showCreate && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Collection name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                maxLength={100}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCreate()}
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
            {/* Suggested boards */}
            {availableSuggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleCreate(suggestion)}
                      disabled={creating}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          <>
            {/* Liked Watches always visible */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Link
                href="/dashboard/liked"
                className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all bg-white"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden">
                  {liked.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={liked.coverUrl} alt="Liked Watches" className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-300">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-gray-900">Liked Watches</p>
                  <p className="text-xs text-gray-500 mt-0.5">{liked.count} {liked.count === 1 ? 'photo' : 'photos'}</p>
                </div>
              </Link>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6">
                <EmptyState
                  icon="📋"
                  title="No custom collections yet"
                  message="Create a collection to organize saved watch photos. Browse the gallery and tap the bookmark icon to save."
                  actionText="Create Your First Collection"
                  actionStyle="blue"
                  onAction={() => setShowCreate(true)}
                />
                {availableSuggestions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 -mt-6 pb-4">
                    {availableSuggestions.slice(0, 4).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleCreate(suggestion)}
                        disabled={creating}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Liked Watches — system collection */}
            <Link
              href="/dashboard/liked"
              className="group block rounded-xl overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all bg-white"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-red-50 to-pink-50 relative overflow-hidden">
                {liked.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={liked.coverUrl}
                    alt="Liked Watches"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-300">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900">Liked Watches</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {liked.count} {liked.count === 1 ? 'photo' : 'photos'}
                </p>
              </div>
            </Link>

            {boards.map((board) => (
              <div key={board.id} className="group relative rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
                {/* Rename inline form */}
                {renaming === board.id ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={renameName}
                      onChange={(e) => setRenameName(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      maxLength={100}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRename(board.id); if (e.key === 'Escape') setRenaming(null) }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => handleRename(board.id)} disabled={saving} className="text-xs text-blue-600 font-medium">Save</button>
                      <button type="button" onClick={() => setRenaming(null)} className="text-xs text-gray-500 font-medium">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link href={`/dashboard/boards/${board.id}`}>
                      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden rounded-t-xl">
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
                    </Link>
                    <div className="p-3 flex items-start justify-between gap-2">
                      <Link href={`/dashboard/boards/${board.id}`} className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{board.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {board.itemCount} {board.itemCount === 1 ? 'photo' : 'photos'}
                        </p>
                      </Link>
                      {/* Three-dot menu */}
                      <div className="relative shrink-0" ref={menuOpen === board.id ? menuRef : undefined}>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setMenuOpen(menuOpen === board.id ? null : board.id) }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          aria-label="Collection options"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {menuOpen === board.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button
                              type="button"
                              onClick={() => {
                                setRenaming(board.id)
                                setRenameName(board.name)
                                setMenuOpen(null)
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                              </svg>
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={() => { setMenuOpen(null); handleDelete(board.id) }}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
