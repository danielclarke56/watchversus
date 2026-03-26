import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export default function QuizBanner() {
  return (
    <section className="border-t border-border py-8">
      <Container>
        <p className="text-center text-sm text-textSecond">
          Not sure what to get?{' '}
          <Link
            href="/quiz"
            className="text-accent hover:text-accentHover font-medium transition-colors"
          >
            Take the Watch Finder →
          </Link>
        </p>
      </Container>
    </section>
  )
}
