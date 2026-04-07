import { redirect } from 'next/navigation'

interface WatchPageProps {
  params: { watchId: string }
}

export default function WatchPage({ params }: WatchPageProps) {
  redirect(`/?watch=${encodeURIComponent(params.watchId)}`)
}
