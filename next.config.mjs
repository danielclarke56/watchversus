/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // www→non-www canonical redirect (GSC SEO fix)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www\\.watchvswatch\\.com',
          },
        ],
        destination: 'https://watchvswatch.com/:path*',
        permanent: true,
      },
      // Blog retired — redirect all /blog/* to /guides
      {
        source: '/blog',
        destination: '/guides',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/guides',
        permanent: true,
      },
      // Rankings retired — merged into /watches
      {
        source: '/rankings',
        destination: '/watches',
        permanent: true,
      },
      // Reviews retired — reviews live on individual watch pages
      {
        source: '/reviews',
        destination: '/watches',
        permanent: true,
      },
      // Guide slug renames & merges
      {
        source: '/guides/best-automatic-watches-under-3000',
        destination: '/guides/best-watches-under-3000',
        permanent: true,
      },
      {
        source: '/guides/best-automatic-watches-for-beginners',
        destination: '/guides/best-watches-for-beginners',
        permanent: true,
      },
      {
        source: '/guides/best-watches-for-first-time-buyers',
        destination: '/guides/best-watches-for-beginners',
        permanent: true,
      },
      {
        source: '/guides/best-sports-watches-for-active-men',
        destination: '/guides/best-sports-watches',
        permanent: true,
      },
      {
        source: '/guides/best-pilot-watches-everyday-wear',
        destination: '/guides/best-pilot-watches',
        permanent: true,
      },
      // Legacy comparison pages deleted — redirect to correct dynamic slugs
      {
        source: '/compare/hamilton-khaki-field-vs-seiko-prospex-spb',
        destination: '/compare/hamilton-khaki-field-auto-38-vs-seiko-prospex-spb143',
        permanent: true,
      },
      {
        source: '/compare/vacheron-constantin-overseas-vs-iwc-portofino',
        destination: '/compare/iwc-portofino-40-vs-vacheron-constantin-overseas-4500v',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
