import { redirect } from 'next/navigation';

export default async function BrandRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/brands/${slug}`);
}
