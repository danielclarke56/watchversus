'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/ui/EmptyState'

interface BoardPhoto {
  id: string
  slug: string | null
  url: string
  thumbnailUrl: string | null
  brandName: string | null
  modelName: string | null
  referenceNumber: string | null
  userName: string
  watchId: string
  savedAt: string
}

interface BoardData {
  id: string
  name: string
  createdAt: string
  photos: BoardPhoto[]
}

export default function BoardDetailClient({ boardId }: { boardId: string }) {
  const router = useRouter()
  const [board, setBoard] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${boardId}`)
      if (!res.ok) {
        setError(true)
        return
      }
      const data = await res.json()
      setBoard(data)
      setEditName(data.name)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => { fetchBoard() }, [fetchBoard])

  async function handleRename() {
    const name = editName.trim()
    if (!name || !board) return
    setSaving(true)
    try {
      const res = await fetch(`/api/collections/${boardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setBoard({ ...board, name })
        setEditing(false)
      }
    } catch (err) {
      console.error('Failed to rename:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemovePhoto(photoId: string) {
    if (!board) return
    setRemoving(photoId)
    try {
      await fetch(`/api/collections/${boardId}/items?photoId=${photoId}`, { method: 'DELETE' })
      setBoard({ ...board, photos: board.photos.filter((p) => p.id !== photoId) })
    } catch (err) {
      console.error('Failed to remove photo:', err)
    } finally {
      setRemoving(null)
    }
  }

  async function handleDeleteBoard() {
    if (!confirm('Delete this board? Photos won\'t be deleted, only removed from the board.')) return
    setDeleting(true)
    try {
      await fetch(`/api/collections/${boardId}`, { method: 'DELETE' })
      router.push('/dashboard/boards')
    } catch (err) {
      console.error('Failed to delete board:', err)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <EmptyState
            icon="404"
            title="Board not found"
            message="This board doesn't exist or you don't have access."
            actionUrl="/dashboard/boards"
            actionText="Back to Boards"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard/boards"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Boards
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-300"
                  maxLength={100}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false) }}
                />
                <button
                  type="button"
                  onClick={handleRename}
                  disabled={saving}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setEditName(board.name) }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{board.name}</h1>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  aria-label="Rename board"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {board.photos.length} {board.photos.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteBoard}
            disabled={deleting}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors shrink-0"
          >
            {deleting ? 'Deleting...' : 'Delete Board'}
          </button>
        </div>

        {/* Photos grid */}
        {board.photos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <EmptyState
                icon="📌"
                title="This board is empty"
                message="Save photos from the gallery by tapping the bookmark icon on any photo."
                actionUrl="/"
                actionText="Browse Gallery"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {board.photos.map((photo) => (
              <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors bg-white">
                <Link href={`/photo/${photo.slug ?? photo.id}`}>
                  <div className="aspect-square bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={`${photo.brandName || 'Watch'} ${photo.modelName || ''} by ${photo.userName}`}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-2 flex items-center justify-between gap-1">
                  <p className="text-xs text-gray-700 truncate flex-1">
                    {[photo.brandName, photo.modelName].filter(Boolean).join(' ') || 'Watch photo'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    disabled={removing === photo.id}
                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    aria-label="Remove from board"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
