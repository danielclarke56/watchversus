'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  isFuture,
  subDays,
} from 'date-fns'
import EmptyState from '@/components/ui/EmptyState'

interface WristCheckEntry {
  id: string
  photoId: string
  date: string
  notes: string | null
  watchId: string
  brandName: string | null
  modelName: string | null
  thumbnailUrl: string | null
  url: string
}

interface UserWatch {
  photoId: string
  watchId: string
  brandName: string | null
  modelName: string | null
  thumbnailUrl: string | null
  url: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WristCheckClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entries, setEntries] = useState<WristCheckEntry[]>([])
  const [watches, setWatches] = useState<UserWatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const monthKey = format(currentMonth, 'yyyy-MM')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [entriesRes, watchesRes] = await Promise.all([
        fetch(`/api/wrist-checks?month=${monthKey}`),
        fetch('/api/user/watches'),
      ])
      if (entriesRes.ok) {
        const data = await entriesRes.json()
        setEntries(data.entries)
      }
      if (watchesRes.ok) {
        const data = await watchesRes.json()
        setWatches(data.watches)
      }
    } catch (err) {
      console.error('Failed to fetch wrist check data:', err)
    } finally {
      setLoading(false)
    }
  }, [monthKey])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAddWatch(photoId: string, date: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/wrist-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId, date }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to add wrist check:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveEntry(entryId: string) {
    try {
      await fetch(`/api/wrist-checks/${entryId}`, { method: 'DELETE' })
      setEntries((prev) => prev.filter((e) => e.id !== entryId))
    } catch (err) {
      console.error('Failed to remove wrist check:', err)
    }
  }

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)

  // Group entries by date
  const entriesByDate = new Map<string, WristCheckEntry[]>()
  for (const entry of entries) {
    const key = entry.date
    if (!entriesByDate.has(key)) entriesByDate.set(key, [])
    entriesByDate.get(key)!.push(entry)
  }

  // Stats
  const totalDaysWorn = entriesByDate.size
  const wearCountByWatch = new Map<string, { count: number; name: string; thumb: string | null }>()
  for (const entry of entries) {
    const key = entry.watchId
    if (!wearCountByWatch.has(key)) {
      wearCountByWatch.set(key, {
        count: 0,
        name: [entry.brandName, entry.modelName].filter(Boolean).join(' ') || 'Watch',
        thumb: entry.thumbnailUrl || entry.url,
      })
    }
    wearCountByWatch.get(key)!.count++
  }
  const wearList = Array.from(wearCountByWatch.values()).sort((a, b) => b.count - a.count)
  const mostWorn = wearList[0] ?? null
  const maxCount = mostWorn?.count ?? 1

  // Current streak
  let streak = 0
  const today = new Date()
  let checkDay = today
  while (true) {
    const dateStr = format(checkDay, 'yyyy-MM-dd')
    // Check current month entries or just break if we go beyond
    if (entriesByDate.has(dateStr)) {
      streak++
      checkDay = subDays(checkDay, 1)
    } else if (isToday(checkDay)) {
      // Today hasn't been logged yet — don't break streak, just skip
      checkDay = subDays(checkDay, 1)
    } else {
      break
    }
  }

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Wrist Check</h1>
        <p className="text-gray-600 text-sm mb-6">Track which watch you wear each day.</p>

        {watches.length === 0 && !loading ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <EmptyState
                icon="⌚"
                title="No watches yet"
                message="Upload and get a watch photo approved to start tracking your wrist checks."
                actionUrl="/upload"
                actionText="Upload a Watch"
                actionStyle="blue"
              />
            </div>
          </div>
        ) : (
          <>
            {/* Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              {loading ? (
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(35)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells before first day */}
                  {[...Array(startDayOfWeek)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayEntries = entriesByDate.get(dateStr) || []
                    const isTodayDate = isToday(day)
                    const isFutureDate = isFuture(day)
                    const isSelected = selectedDate === dateStr

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          if (!isFutureDate) setSelectedDate(isSelected ? null : dateStr)
                        }}
                        disabled={isFutureDate}
                        className={`aspect-square p-1 rounded-lg border transition-all flex flex-col items-start relative ${
                          isSelected
                            ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200'
                            : isTodayDate
                            ? 'border-blue-300 bg-blue-50/50'
                            : dayEntries.length > 0
                            ? 'border-gray-200 bg-white hover:border-blue-300'
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                        } ${isFutureDate ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
                      >
                        <span className={`text-xs font-medium ${
                          isTodayDate ? 'text-blue-600' : 'text-gray-700'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {dayEntries.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-auto w-full justify-start">
                            {dayEntries.slice(0, 3).map((entry) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={entry.id}
                                src={entry.thumbnailUrl || entry.url}
                                alt={entry.brandName || 'Watch'}
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-white"
                              />
                            ))}
                            {dayEntries.length > 3 && (
                              <span className="text-[9px] text-gray-400 self-center">+{dayEntries.length - 3}</span>
                            )}
                          </div>
                        )}
                        {!isFutureDate && dayEntries.length === 0 && (
                          <span className="text-gray-300 text-xs mt-auto opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Watch picker for selected date */}
            {selectedDate && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Close
                  </button>
                </div>

                {/* Already logged watches for this day */}
                {(() => {
                  const dayEntries = entriesByDate.get(selectedDate) || []
                  return dayEntries.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Worn today:</p>
                      <div className="flex flex-wrap gap-2">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.thumbnailUrl || entry.url}
                              alt={entry.brandName || 'Watch'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {[entry.brandName, entry.modelName].filter(Boolean).join(' ') || 'Watch'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEntry(entry.id)}
                              className="text-gray-400 hover:text-red-500 ml-1 transition-colors"
                              aria-label="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}

                {/* Watch picker */}
                <p className="text-xs text-gray-500 mb-2">
                  {(entriesByDate.get(selectedDate) || []).length > 0 ? 'Add another watch:' : 'Select a watch:'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {watches.map((watch) => {
                    const dayEntries = entriesByDate.get(selectedDate) || []
                    const alreadyLogged = dayEntries.some((e) => e.photoId === watch.photoId)
                    return (
                      <button
                        key={watch.photoId}
                        type="button"
                        onClick={() => !alreadyLogged && handleAddWatch(watch.photoId, selectedDate)}
                        disabled={saving || alreadyLogged}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors text-left ${
                          alreadyLogged
                            ? 'border-blue-200 bg-blue-50 opacity-60 cursor-default'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={watch.thumbnailUrl || watch.url}
                          alt={watch.brandName || 'Watch'}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {watch.brandName || 'Watch'}
                          </p>
                          {watch.modelName && (
                            <p className="text-[11px] text-gray-500 truncate">{watch.modelName}</p>
                          )}
                        </div>
                        {alreadyLogged && (
                          <svg className="w-4 h-4 text-blue-500 shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            {entries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM')} Stats
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalDaysWorn}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Days Worn</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Checks</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{streak}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Day Streak</p>
                  </div>
                </div>

                {/* Per-watch breakdown */}
                {wearList.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Wear Count</p>
                    <div className="space-y-2.5">
                      {wearList.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumb || ''}
                            alt={item.name}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                              <span className="text-xs text-gray-500 shrink-0 ml-2">{item.count}d</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-500 rounded-full h-1.5 transition-all"
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
