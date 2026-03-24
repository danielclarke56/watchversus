import type { Metadata } from 'next'
import Link from 'next/link'
import { getRedis } from '@/lib/redis'
import { comparisonTiers, getWatchBySlug } from '@/lib/watches'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Watch Comparison Stats & Trends | WatchVsWatch',
  description:
    `Live community voting data across ${comparisonTiers.length} watch comparisons. See the most voted matchups, biggest community consensus picks, and trending comparisons on WatchVsWatch.`,
  alternates: { canonical: 'https://watchvswatch.com/stats' },
  openGraph: {
    title: 'Watch Comparison Stats & Trends | WatchVsWatch',
    description:
      `Live community voting data across ${comparisonTiers.length} watch comparisons. Most voted, most lopsided, and trending matchups.`,
    url: 'https://watchvswatch.com/stats',
    type: 'website',
  },
}

interface VoteStat {
  slug: string
  slug1: string
  slug2: string
  watch1: number
  watch2: number
  total: number
  pctLeader: number
  leaderName: string
  trailerName: string
}

async function getVoteStats(): Promise<VoteStat[]> {
  const redis = getRedis()
  const stats: VoteStat[] = []

  for (const tier of comparisonTiers) {
    const slug = `${tier.slug1}-vs-${tier.slug2}`
    let watch1 = 0
    let watch2 = 0

    if (redis) {
      try {
        const raw = (await redis.hgetall('votes:' + slug)) as Record<string, string> | null
        if (raw) {
          watch1 = parseInt(raw.watch1 ?? '0', 10)
          watch2 = parseInt(raw.watch2 ?? '0', 10)
        }
      } catch {
        // skip
      }
    }

    const total = watch1 + watch2
    const w1 = getWatchBySlug(tier.slug1)
    const w2 = getWatchBySlug(tier.slug2)
    if (!w1 || !w2) continue

    const w1Name = `${w1.brand} ${w1.name}`
    const w2Name = `${w2.brand} ${w2.name}`
    const pct1 = total > 0 ? Math.round((watch1 / total) * 100) : 50

    stats.push({
      slug,
      slug1: tier.slug1,
      slug2: tier.slug2,
      watch1,
      watch2,
      total,
      pctLeader: total > 0 ? Math.max(pct1, 100 - pct1) : 50,
      leaderName: pct1 >= 50 ? w1Name : w2Name,
      trailerName: pct1 >= 50 ? w2Name : w1Name,
    })
  }

  return stats
}

function StatCard({
  stat,
  badge,
  badgeColor,
}: {
  stat: VoteStat
  badge?: string
  badgeColor?: string
}) {
  return (
    <Link
      href={`/compare/${stat.slug}`}
      className="card p-4 hover:border-borderStrong hover:-translate-y-0.5 hover:shadow-md transition-all group block"
    >
      {badge && (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeColor ?? 'text-accent'}`}>
          {badge}
        </span>
      )}
      <p className="text-sm font-bold text-textPrimary mt-1 group-hover:text-accent transition-colors">
        {stat.leaderName} <span className="text-accent text-xs">vs</span> {stat.trailerName}
      </p>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-border">
          <div
            className="bg-accent h-full rounded-full transition-all"
            style={{ width: `${stat.pctLeader}%` }}
          />
        </div>
        <span className="text-xs font-bold text-accent shrink-0">{stat.pctLeader}%</span>
      </div>
      <p className="text-xs text-textMuted mt-1">
        {stat.total.toLocaleString()} vote{stat.total !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}

export default async function StatsPage() {
  const allStats = await getVoteStats()
  const withVotes = allStats.filter((s) => s.total > 0)
  const totalVotes = withVotes.reduce((sum, s) => sum + s.total, 0)

  const mostVoted = [...withVotes].sort((a, b) => b.total - a.total).slice(0, 10)
  const mostLopsided = [...withVotes]
    .filter((s) => s.total >= 5)
    .sort((a, b) => b.pctLeader - a.pctLeader)
    .slice(0, 10)
  const closestRaces = [...withVotes]
    .filter((s) => s.total >= 5)
    .sort((a, b) => a.pctLeader - b.pctLeader)
    .slice(0, 10)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Watch Comparison Stats & Trends',
    description: `Community voting data across ${comparisonTiers.length} watch comparisons with ${totalVotes.toLocaleString()} total votes.`,
    url: 'https://watchvswatch.com/stats',
    isPartOf: {
      '@type': 'WebSite',
      name: 'WatchVsWatch',
      url: 'https://watchvswatch.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <nav className="text-sm text-textMuted mb-4 flex items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span aria-hidden="true">›</span>
            <span className="text-textPrimary">Stats</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-textPrimary mb-3">
            Community Voting Stats & Trends
          </h1>
          <p className="text-textSecond text-base leading-relaxed max-w-2xl">
            Real-time data from the WatchVsWatch community. {totalVotes.toLocaleString()} votes
            cast across {withVotes.length} active comparisons out of {comparisonTiers.length} total matchups.
          </p>
        </div>

        {/* Summary counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-accent">{totalVotes.toLocaleString()}</p>
            <p className="text-xs text-textMuted mt-1">Total Votes</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-accent">{comparisonTiers.length}</p>
            <p className="text-xs text-textMuted mt-1">Comparisons</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-accent">{withVotes.length}</p>
            <p className="text-xs text-textMuted mt-1">Active Matchups</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-accent">
              {withVotes.length > 0
                ? Math.round(totalVotes / withVotes.length)
                : 0}
            </p>
            <p className="text-xs text-textMuted mt-1">Avg Votes/Matchup</p>
          </div>
        </div>

        {/* Most Voted */}
        {mostVoted.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-textPrimary mb-1">Most Voted Comparisons</h2>
            <p className="text-sm text-textSecond mb-5">
              The matchups generating the most community engagement.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mostVoted.map((s, i) => (
                <StatCard
                  key={s.slug}
                  stat={s}
                  badge={i === 0 ? 'Most Popular' : undefined}
                  badgeColor="text-winner"
                />
              ))}
            </div>
          </section>
        )}

        {/* Biggest Consensus */}
        {mostLopsided.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-textPrimary mb-1">Biggest Community Consensus</h2>
            <p className="text-sm text-textSecond mb-5">
              Comparisons where the community has the strongest opinion. One watch dominates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mostLopsided.map((s, i) => (
                <StatCard
                  key={s.slug}
                  stat={s}
                  badge={i === 0 ? 'Strongest Consensus' : undefined}
                  badgeColor="text-winner"
                />
              ))}
            </div>
          </section>
        )}

        {/* Closest Races */}
        {closestRaces.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-textPrimary mb-1">Closest Races</h2>
            <p className="text-sm text-textSecond mb-5">
              Neck-and-neck matchups where the community is most divided. Every vote counts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {closestRaces.map((s, i) => (
                <StatCard
                  key={s.slug}
                  stat={s}
                  badge={i === 0 ? 'Tightest Race' : undefined}
                  badgeColor="text-accent"
                />
              ))}
            </div>
          </section>
        )}

        {/* No votes state */}
        {withVotes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-textSecond text-lg mb-4">No votes yet — be the first!</p>
            <Link href="/compare" className="btn-gold text-sm px-6 py-3 rounded-md font-semibold">
              Browse Comparisons
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-surface border border-border rounded-sm p-8">
          <h3 className="text-textPrimary font-semibold text-lg mb-2">Cast Your Vote</h3>
          <p className="text-textSecond text-sm mb-5">
            Every vote shapes the community data. Pick a comparison and weigh in.
          </p>
          <Link href="/compare" className="btn-outline inline-flex items-center justify-center min-h-[48px] px-6">
            Browse All Comparisons
          </Link>
        </div>
      </div>
    </>
  )
}
