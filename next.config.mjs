/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-5454588e96dd48eea58ff55965bbe8f5.r2.dev',
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
      // Focus on photo gallery only — unpublish all other sections
      {
        source: '/watches',
        destination: '/',
        permanent: true,
      },
      {
        source: '/watches/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/',
        permanent: true,
      },
      {
        source: '/compare/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/explore',
        destination: '/',
        permanent: true,
      },
      {
        source: '/guides',
        destination: '/',
        permanent: true,
      },
      {
        source: '/guides/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/quiz',
        destination: '/',
        permanent: true,
      },
      {
        source: '/quiz/:slug*',
        destination: '/',
        permanent: true,
      },
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
      // Blog retired — redirect all /blog/* to homepage
      {
        source: '/blog',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/',
        permanent: true,
      },
      // Rankings retired — redirect to homepage
      {
        source: '/rankings',
        destination: '/',
        permanent: true,
      },
      // Reviews retired — redirect to homepage
      {
        source: '/reviews',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
