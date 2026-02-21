import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Per-route meta definitions ──────────────────────────────────────────────
const routeMeta = [
  {
    route: '/',
    title: 'APAI | Smart Auto Glass Shop Management Software',
    description:
      'Scale your auto glass business with APAI. Automate quoting, invoicing, and NAGS pricing. The all-in-one AI platform built to grow your shop for only $99/mo.',
  },
  {
    route: '/features',
    title: 'APAI Features | Auto Glass Shop Automation Tools',
    description:
      "Explore APAI's powerful features: AI quoting, NAGS pricing, invoicing, scheduling, customer management and more — built for auto glass shops.",
  },
  {
    route: '/pricing',
    title: 'APAI Pricing | Affordable Plans for Auto Glass Shops',
    description:
      'Simple, transparent pricing for APAI. Start automating your auto glass shop for just $99/mo. No hidden fees. Cancel anytime.',
  },
  {
    route: '/about',
    title: 'About APAI | The Auto Glass Shop Management Platform',
    description:
      'Learn about APAI — the team behind the smart auto glass shop management platform helping shops grow faster with AI-powered automation.',
  },
  {
    route: '/contact',
    title: 'Contact APAI | Get in Touch with Our Team',
    description:
      "Have questions about APAI? Contact our team for support, sales inquiries, or partnerships. We're here to help your auto glass shop succeed.",
  },
  {
    route: '/blogs',
    title: 'APAI Blog | Auto Glass Business Tips & Industry News',
    description:
      'Read the latest articles on auto glass shop management, industry trends, NAGS pricing tips, and business growth strategies from the APAI team.',
  },
  {
    route: '/auth',
    title: 'Sign In or Sign Up | APAI',
    description:
      'Sign in to your APAI account or create a new account to start managing your auto glass shop smarter.',
  },
  {
    route: '/privacy-policy',
    title: 'Privacy Policy | APAI',
    description:
      'Read the APAI Privacy Policy to understand how we collect, use, and protect your personal information.',
  },
  {
    route: '/terms-of-service',
    title: 'Terms of Service | APAI Auto Glass Management Software',
    description:
      "Review the terms and conditions for using APAI's AI-powered auto glass platform. Learn about subscriptions, usage rights, and our $99 service.",
  },
  {
    route: '/sitemap',
    title: 'Sitemap | APAI',
    description: 'Browse all pages on the APAI platform.',
  },
]
// ─────────────────────────────────────────────────────────────────────────────

/** Injects <title> and <meta name="description"> just before </head> */
function injectMeta(html, title, description) {
  return html.replace(
    '</head>',
    `  <title>${title}</title>\n  <meta name="description" content="${description}" />\n</head>`
  )
}

/**
 * Vite plugin: injects per-route meta tags into index.html at build time.
 *  - transformIndexHtml → injects home-page meta into the main dist/index.html
 *  - closeBundle        → creates dist/<route>/index.html for every other route
 */
function metaInjectionPlugin() {
  let capturedHtml = ''

  return {
    name: 'meta-injection',

    // Runs on every HTML transform (dev serve + build)
    transformIndexHtml(html) {
      capturedHtml = html
      const home = routeMeta.find((r) => r.route === '/')
      return injectMeta(html, home.title, home.description)
    },

    // Runs after build output is written
    async closeBundle() {
      if (!capturedHtml) return
      const distDir = path.join(__dirname, 'dist')

      // ── Static routes ─────────────────────────────────────────────
      for (const { route, title, description } of routeMeta) {
        if (route === '/') continue // already handled by transformIndexHtml

        const html = injectMeta(capturedHtml, title, description)
        const folder = path.join(distDir, route.slice(1)) // strip leading /
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.join(folder, 'index.html'), html, 'utf-8')
        console.log(`✅  Meta injected → dist${route}/index.html`)
      }

      // ── Blog posts (fetched from API at build time) ───────────────
      try {
        const API = process.env.VITE_JAVA_API_URL || 'https://javaapi.autopaneai.com/api'
        console.log('\n📡  Fetching blogs from API for meta injection…')
        const res = await fetch(`${API}/v1/blogs`)
        if (!res.ok) throw new Error(`API responded with ${res.status}`)

        const blogs = await res.json()
        let count = 0
        for (const blog of blogs) {
          const slug = blog.slug
          if (!slug) continue
          const title = blog.metaTitle || blog.title || 'APAI Blog'
          const description = blog.metaDescription || blog.excerpt || 'Read this article on APAI.'
          const html = injectMeta(capturedHtml, title, description)
          const folder = path.join(distDir, 'blogs', slug)
          fs.mkdirSync(folder, { recursive: true })
          fs.writeFileSync(path.join(folder, 'index.html'), html, 'utf-8')
          console.log(`✅  Blog meta injected → dist/blogs/${slug}/index.html`)
          count++
        }
        console.log(`\n🎉  ${count} blog(s) pre-rendered for SEO.\n`)
      } catch (e) {
        console.warn(`\n⚠️  Blog meta injection skipped: ${e.message}\n`)
      }

      console.log('🎉  Per-route meta injection complete.\n')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), metaInjectionPlugin()],
  build: {
    sourcemap: false,
    target: 'esnext',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios'],
          ui: ['antd', '@ant-design/icons', 'antd-img-crop'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          pdf: ['jspdf', 'jspdf-autotable'],
          editor: ['react-quill-new'],
          utils: ['browser-image-compression'],
        },
      },
    },
  },
})
