'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

const DONUT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

function DonutChart({ items, total }: { items: { count: number; name: string }[]; total: number }) {
  const size = 160
  const strokeWidth = 28
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  let accumulated = 0

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        {/* Segments */}
        {items.map((item, i) => {
          const pct = total > 0 ? item.count / total : 0
          const dashLength = pct * circumference
          const dashOffset = circumference - accumulated * circumference
          accumulated += pct
          return (
            <circle
              key={item.name}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
        })}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-900 text-2xl font-bold" fontSize="24">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-500" fontSize="10">
          checks
        </text>
      </svg>
    </div>
  )
}

export default function WristCheckClient() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [entries, setEntries] = useState<WristCheckEntry[]>([])
  const [watches, setWatches] = useState<UserWatch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [streak, setStreak] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const monthKey = format(currentMonth, 'yyyy-MM')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch current month entries, user watches, and previous month (for streak calculation)
      const prevMonthKey = format(subMonths(new Date(monthKey + '-01'), 1), 'yyyy-MM')
      const [entriesRes, watchesRes, prevRes] = await Promise.all([
        fetch(`/api/wrist-checks?month=${monthKey}`),
        fetch('/api/user/watches'),
        fetch(`/api/wrist-checks?month=${prevMonthKey}`),
      ])
      if (entriesRes.ok) {
        const data = await entriesRes.json()
        setEntries(data.entries)
      }
      if (watchesRes.ok) {
        const data = await watchesRes.json()
        setWatches(data.watches)
      }

      // Compute streak from both months' entries
      const allDatesSet = new Set<string>()
      if (entriesRes.ok) {
        const data = await entriesRes.clone().json()
        for (const e of data.entries) allDatesSet.add(e.date)
      }
      if (prevRes.ok) {
        const data = await prevRes.json()
        for (const e of data.entries) allDatesSet.add(e.date)
      }

      let s = 0
      let day = new Date()
      while (true) {
        const ds = format(day, 'yyyy-MM-dd')
        if (allDatesSet.has(ds)) {
          s++
          day = subDays(day, 1)
        } else if (isToday(day)) {
          day = subDays(day, 1)
        } else {
          break
        }
      }
      setStreak(s)
    } catch (err) {
      console.error('Failed to fetch wrist check data:', err)
    } finally {
      setLoading(false)
    }
  }, [monthKey])

  useEffect(() => { fetchData() }, [fetchData])

  // Close dropdown on outside click
  useEffect(() => {
    if (!selectedDate) return
    const handler = (e: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSelectedDate(null)
      }
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [selectedDate])

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

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
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
            <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Calendar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex-1 min-w-0">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => { setCurrentMonth(subMonths(currentMonth, 1)); setSelectedDate(null) }}
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
                  onClick={() => { setCurrentMonth(addMonths(currentMonth, 1)); setSelectedDate(null) }}
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
                      <div key={dateStr} className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isFutureDate) setSelectedDate(isSelected ? null : dateStr)
                          }}
                          disabled={isFutureDate}
                          className={`w-full aspect-square p-1 rounded-lg border transition-all flex flex-col items-start ${
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
                        </button>

                        {/* Dropdown popover — anchored to the day cell */}
                        {isSelected && (
                          <div
                            ref={dropdownRef}
                            className="absolute z-50 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64 sm:w-72"
                            style={{
                              // Position: try to keep within viewport
                              left: '50%',
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-gray-900">
                                {format(new Date(dateStr + 'T12:00:00'), 'EEE, MMM d')}
                              </p>
                              <button
                                type="button"
                                onClick={() => setSelectedDate(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Already logged */}
                            {dayEntries.length > 0 && (
                              <div className="mb-2 space-y-1">
                                {dayEntries.map((entry) => (
                                  <div key={entry.id} className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1.5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={entry.thumbnailUrl || entry.url}
                                      alt={entry.brandName || 'Watch'}
                                      className="w-7 h-7 rounded-full object-cover shrink-0"
                                    />
                                    <span className="text-xs font-medium text-gray-900 truncate flex-1">
                                      {[entry.brandName, entry.modelName].filter(Boolean).join(' ') || 'Watch'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEntry(entry.id)}
                                      className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
                                      aria-label="Remove"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Watch list */}
                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                              {watches.map((watch) => {
                                const alreadyLogged = dayEntries.some((e) => e.photoId === watch.photoId)
                                return (
                                  <button
                                    key={watch.photoId}
                                    type="button"
                                    onClick={() => !alreadyLogged && handleAddWatch(watch.photoId, dateStr)}
                                    disabled={saving || alreadyLogged}
                                    className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors text-left ${
                                      alreadyLogged
                                        ? 'opacity-40 cursor-default'
                                        : 'hover:bg-gray-50 cursor-pointer'
                                    }`}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={watch.thumbnailUrl || watch.url}
                                      alt={watch.brandName || 'Watch'}
                                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-900 truncate">
                                        {watch.brandName || 'Watch'}
                                      </p>
                                      {watch.modelName && (
                                        <p className="text-[11px] text-gray-500 truncate">{watch.modelName}</p>
                                      )}
                                    </div>
                                    {alreadyLogged && (
                                      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right side — Stats + Donut chart */}
            <div className="lg:w-72 shrink-0 space-y-4">
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-3 text-center lg:text-left lg:flex lg:items-center lg:gap-3">
                  <p className="text-2xl font-bold text-gray-900">{totalDaysWorn}</p>
                  <p className="text-xs text-gray-500">Days Worn</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-3 text-center lg:text-left lg:flex lg:items-center lg:gap-3">
                  <p className="text-2xl font-bold text-gray-900">{streak}</p>
                  <p className="text-xs text-gray-500">Day Streak</p>
                </div>
              </div>

              {/* Donut chart */}
              {wearList.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Wear Count</p>
                  <DonutChart items={wearList} total={entries.length} />
                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                    {wearList.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumb || ''}
                          alt={item.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="text-xs text-gray-900 truncate flex-1">{item.name}</span>
                        <span className="text-xs text-gray-500 shrink-0">{item.count}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unworn watches */}
              {(() => {
                const wornWatchIds = new Set(entries.map((e) => e.watchId))
                const unworn = watches.filter((w) => !wornWatchIds.has(w.watchId))
                if (unworn.length === 0) return null
                return (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Not Worn in {format(currentMonth, 'MMMM')}
                    </p>
                    <div className="space-y-2">
                      {unworn.map((watch) => (
                        <div key={watch.photoId} className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={watch.thumbnailUrl || watch.url}
                            alt={watch.brandName || 'Watch'}
                            className="w-6 h-6 rounded-full object-cover shrink-0 opacity-50 grayscale"
                          />
                          <span className="text-xs text-gray-400 truncate">
                            {[watch.brandName, watch.modelName].filter(Boolean).join(' ') || 'Watch'}
                          </span>
                          <span className="text-[10px] text-gray-300 shrink-0">0d</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
