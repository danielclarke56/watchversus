/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
  },
  async redirects() {
    return [
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
    ]
  },
};

export default nextConfig;
