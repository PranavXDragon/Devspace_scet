/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production, point to the deployed backend URL. In dev, default to localhost:5000
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;
