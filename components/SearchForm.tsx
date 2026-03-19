'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SearchFormProps {
  placeholder?: string
}

export function SearchForm({ placeholder = 'Search: Submariner vs Seamaster…' }: SearchFormProps) {
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value
    if (q) {
      router.push(`/compare?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/compare')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2 max-w-xl mx-auto">
        <Input
          type="text"
          name="q"
          placeholder={placeholder}
          className="flex-1"
        />
        <Button variant="secondary" size="md" type="submit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Button>
      </div>
    </form>
  )
}
