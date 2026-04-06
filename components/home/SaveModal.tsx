'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bookmark, Plus, Check, Loader2 } from 'lucide-react'

interface CollectionEntry {
  id: string
  name: string
  checked: boolean
}

interface SaveModalProps {
  photoId: string
  className?: string
  isSaved: boolean
  iconSize?: number
  onSavedChange?: (saved: boolean) => void
}

export default function SaveModal({ photoId, className = '', isSaved, iconSize = 16, onSavedChange }: SaveModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [collections, setCollections] = useState<CollectionEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const [colRes, savedRes] = await Promise.all([
        fetch('/api/collections'),
        fetch(`/api/photos/${photoId}/saved`),
      ])

      if (!colRes.ok) {
        // Not authenticated
        setCollections([])
        setLoading(false)
        return
      }

      const colData = await colRes.json()
      const savedData = await savedRes.json()
      const savedSet = new Set<string>(savedData.savedIn || [])

      setCollections(
        (colData.collections || []).map((c: { id: string; name: string }) => ({
          id: c.id,
          name: c.name,
          checked: savedSet.has(c.id),
        }))
      )
    } catch {
      setCollections([])
    } finally {
      setLoading(false)
    }
  }, [photoId])

  useEffect(() => {
    if (isOpen) {
      fetchCollections()
    }
  }, [isOpen, fetchCollections])

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('pointerdown', handleClickOutside)
    }
    return () => window.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  const handleToggle = async (collectionId: string, currentlyChecked: boolean) => {
    // Optimistic update
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collectionId ? { ...c, checked: !currentlyChecked } : c
      )
    )

    try {
      if (currentlyChecked) {
        await fetch(`/api/collections/${collectionId}/items?photoId=${photoId}`, {
          method: 'DELETE',
        })
      } else {
        await fetch(`/api/collections/${collectionId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId }),
        })
      }
    } catch {
      // Revert on error
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId ? { ...c, checked: currentlyChecked } : c
        )
      )
    }

    // Update parent saved state
    const anyChecked = collections.some((c) =>
      c.id === collectionId ? !currentlyChecked : c.checked
    )
    onSavedChange?.(anyChecked)
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name || creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const data = await res.json()
        // Add to collection and immediately save the photo to it
        setCollections((prev) => [...prev, { id: data.id, name: data.name, checked: true }])
        setNewName('')
        await fetch(`/api/collections/${data.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId }),
        })
        onSavedChange?.(true)
      }
    } catch {
      // ignore
    } finally {
      setCreating(false)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleButtonClick}
        className={`backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center transition-all ${
          isSaved
            ? 'text-white bg-amber-500 hover:bg-amber-600'
            : 'text-white bg-black/50 hover:bg-black/70'
        }`}
        aria-label="Save to collection"
      >
        <Bookmark size={iconSize} fill={isSaved ? 'currentColor' : 'none'} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] max-h-[300px] z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-3 pb-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Save to collection
          </p>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="max-h-[180px] overflow-y-auto">
              {collections.map((col) => (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      col.checked ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleToggle(col.id, col.checked)
                    }}
                  >
                    {col.checked && <Check size={12} className="text-white" />}
                  </span>
                  <span className="truncate">{col.name}</span>
                </label>
              ))}
              {collections.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">No collections yet</p>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 mt-1 pt-1 px-3">
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                placeholder="New collection"
                className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400 min-w-0"
                maxLength={100}
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-40 p-1"
                aria-label="Create collection"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
