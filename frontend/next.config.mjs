/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // NEXT_PUBLIC_API_URL:
  //   - Leave empty on Vercel (frontend + API on same domain)
  //   - Set to http://localhost:8000 for local dev without Docker
}

export default nextConfig
