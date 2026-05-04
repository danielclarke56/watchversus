'use client'

import { useState } from 'react'
import { tb } from '@/lib/styles'

export interface RankEntry {
  rank: number
  brand: string
  model: string
  price: string
  caseSize: string
  thickness: string
  movement: string
  crystal: string
  wr: string
  url?: string
}

interface RankingTableProps {
  rows: RankEntry[]
  initialCount?: number
}

function CopyCell({ brand, model }: { brand: string; model: string }) {
  const [copied, setCopied] = useState(false)
  const fullName = model

  function handleCopy() {
    navigator.clipboard.writeText(fullName).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="group/copy flex items-center gap-1.5 text-left w-full"
      title={`Copy "${fullName}"`}
    >
      <span>
        <span className="text-textMuted font-normal mr-1.5">{brand}</span>
        {model.replace(brand + ' ', '')}
      </span>
      <span className="opacity-0 group-hover/copy:opacity-100 transition-opacity shrink-0">
        {copied ? (
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </span>
    </button>
  )
}

export function RankingTable({ rows, initialCount = 25 }: RankingTableProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? rows : rows.slice(0, initialCount)
  const remaining = rows.length - initialCount

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm border-collapse bg-surface">
          <caption className="sr-only">Top 50 watches under $500 — community ranking</caption>
          <thead>
            <tr className="bg-surfaceAlt border-b border-border">
              <th scope="col" className={`px-3 py-3.5 text-center ${tb.header} whitespace-nowrap w-10`}>#</th>
              <th scope="col" className={`sticky left-0 z-10 bg-surfaceAlt px-4 py-3.5 text-left ${tb.header} whitespace-nowrap border-l border-r border-border`}>Brand &amp; Model</th>
              <th scope="col" className={`px-4 py-3.5 text-right ${tb.header} whitespace-nowrap`}>Price</th>
              <th scope="col" className={`px-4 py-3.5 text-left ${tb.header} whitespace-nowrap hidden sm:table-cell`}>Case</th>
              <th scope="col" className={`px-4 py-3.5 text-left ${tb.header} whitespace-nowrap hidden md:table-cell`}>Thick</th>
              <th scope="col" className={`px-4 py-3.5 text-left ${tb.header} whitespace-nowrap hidden lg:table-cell`}>Movement</th>
              <th scope="col" className={`px-4 py-3.5 text-left ${tb.header} whitespace-nowrap hidden md:table-cell`}>Crystal</th>
              <th scope="col" className={`px-4 py-3.5 text-left ${tb.header} whitespace-nowrap hidden sm:table-cell`}>WR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((row) => (
              <tr key={row.rank} className="hover:bg-surfaceAlt transition-colors">
                <td className={`px-3 py-3 text-center ${tb.cell} tabular-nums text-textMuted`}>{row.rank}</td>
                <td className={`sticky left-0 z-10 px-4 py-3 bg-surface hover:bg-surfaceAlt transition-colors ${tb.cellStrong} whitespace-nowrap border-l border-r border-border`}>
                  <CopyCell brand={row.brand} model={row.model} />
                </td>
                <td className={`px-4 py-3 ${tb.cellStrong} whitespace-nowrap tabular-nums text-right`}>{row.price}</td>
                <td className={`px-4 py-3 ${tb.cell} hidden sm:table-cell whitespace-nowrap`}>{row.caseSize}</td>
                <td className={`px-4 py-3 ${tb.cell} hidden md:table-cell whitespace-nowrap tabular-nums`}>{row.thickness}</td>
                <td className={`px-4 py-3 ${tb.cell} hidden lg:table-cell`}>{row.movement}</td>
                <td className={`px-4 py-3 ${tb.cell} hidden md:table-cell whitespace-nowrap`}>{row.crystal}</td>
                <td className={`px-4 py-3 ${tb.cell} hidden sm:table-cell whitespace-nowrap`}>{row.wr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!expanded && remaining > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-surface hover:bg-surfaceAlt text-sm font-medium text-textSecond hover:text-textPrimary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Show {remaining} more watches
          </button>
        </div>
      )}

      {expanded && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-surface hover:bg-surfaceAlt text-sm font-medium text-textSecond hover:text-textPrimary transition-colors"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            Show less
          </button>
        </div>
      )}
    </div>
  )
}
