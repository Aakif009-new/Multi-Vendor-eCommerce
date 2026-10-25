/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    let backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      '';

    // Guard against self-proxy loops: if unset, relative, or pointing to Next.js port 3000, route to Express on port 5000
    if (!backendUrl || backendUrl.includes(':3000') || backendUrl.startsWith('/')) {
      backendUrl = 'http://localhost:5000';
    }

    const cleanBackendUrl = backendUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${cleanBackendUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
