'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Link, Check } from 'lucide-react'

interface ShareDropdownProps {
  photoId: string
  className?: string
  iconSize?: number
}

export default function ShareDropdown({ photoId, className = '', iconSize = 16 }: ShareDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const shareUrl = `https://watchems.com/photo/${photoId}`

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

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
      setIsOpen(false)
    }, 1500)
  }

  const handleShareX = () => {
    const text = encodeURIComponent('Check out this watch on Watchems!')
    const url = encodeURIComponent(shareUrl)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className="text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center transition-all"
        aria-label="Share photo"
      >
        <Share2 size={iconSize} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Link size={14} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={handleShareX}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
          >
            <span className="text-sm font-bold w-3.5 text-center">𝕏</span>
            Share on X
          </button>
        </div>
      )}
    </div>
  )
}
