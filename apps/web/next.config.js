/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    basePath: process.env.NODE_ENV === "production" ? "/merch" : "",
}

module.exports = nextConfig
