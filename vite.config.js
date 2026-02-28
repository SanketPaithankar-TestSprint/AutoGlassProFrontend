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
    title: 'APAI Features | VIN Decode, AI Chat, Quotes & NAGS Data',
    description:
      "Explore APAI's powerful features: AI quoting, NAGS pricing, invoicing, scheduling, customer management and more — built for auto glass shops.",
  },
  {
    route: '/pricing',
    title: 'APAI Pricing | Transparent Auto Glass Software for $99/mo',
    description:
      'Simple, flat-rate pricing for your auto glass shop. Get full access to VIN decoding, NAGS data, and invoicing for just $99/month. No contracts, no hidden fees.',
  },
  {
    route: '/about',
    title: 'About APAI | Empowering Independent Auto Glass Shops',
    description:
      'Learn the story behind APAI. We’re empowering independent auto glass shops with AI-driven tools to automate workflows, increase profits, and simplify scaling.',
  },
  {
    route: '/contact',
    title: 'Contact APAI | Sign Up for Your Auto Glass Business',
    description:
      'Have questions about APAI? Contact our team today for support, demos, or sign up for 30 days trial. We’re here to help your auto glass shop succeed.',
  },
  {
    route: '/privacy-policy',
    title: 'Privacy Policy | APAI Auto Glass Management Software',
    description:
      'Read the APAI Privacy Policy. Learn how we protect your auto glass shop’s data, ensure secure transactions, and maintain your business confidentiality.',
  },
  {
    route: '/blogs',
    title: 'Auto Glass Business Insights & Guides | APAI Blog',
    description:
      "Expert advice for auto glass shop owners. Read our latest guides on scaling your business, and using AI features to increase your shop's profitability.",
  },
  {
    route: '/sitemap',
    title: 'Sitemap | APAI Auto Glass Management Software',
    description: 'Navigate the APAI website easily. Find links to our shop management features, pricing, blog guides, and support resources for auto glass professionals.',
  },
  // Not in CSV, keep as is
  {
    route: '/auth',
    title: 'Sign In or Sign Up | APAI',
    description:
      'Sign in to your APAI account or create a new account to start managing your auto glass shop smarter.',
  },
  {
    route: '/terms-of-service',
    title: 'Terms of Service | APAI Auto Glass Management Software',
    description:
      "Review the terms and conditions for using APAI's AI-powered auto glass platform. Learn about subscriptions, usage rights, and our $99 service.",
  },
]
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Strips any existing <title>, <meta name="description">, <meta property="og:...">,
 * <meta name="twitter:...">, and <link rel="canonical"> tags from the HTML string.
 */
function stripExistingMeta(html) {
  return html
    .replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/(\r?\n\s*){3,}/g, '\n\n') // collapse multiple blank lines
}

/**
 * Escapes characters that would break an HTML attribute value.
 * Replaces " with &quot; and ' with &#39;
 */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Injects <title> and <meta name="description"> just before </head>.
 * Assumes html has already been stripped of existing meta tags.
 */
function injectMeta(html, { title, description }) {
  const tags = [
    `  <title>${esc(title)}</title>`,
    `  <meta name="description" content="${esc(description)}" />`,
  ].join('\n')

  return html.replace('</head>', `${tags}\n</head>`)
}

/**
 * Vite plugin: injects per-route meta tags into index.html at build time.
 *  - transformIndexHtml → injects home-page meta into the main dist/index.html
 *  - closeBundle        → reads the fully-resolved dist/index.html from disk,
 *                         then creates dist/<route>/index.html for every other
 *                         route + fetches all blog slugs from API to generate
 *                         dist/blogs/<slug>/index.html with blog-specific tags.
 */
function metaInjectionPlugin() {
  return {
    name: 'meta-injection',

    // Injects home-page meta into the main dist/index.html
    transformIndexHtml(html) {
      const home = routeMeta.find((r) => r.route === '/')
      // Strip first (index.html has no meta yet, but be safe), then inject
      const clean = stripExistingMeta(html)
      return injectMeta(clean, {
        title: home.title,
        description: home.description,
      })
    },

    // Runs after Vite has written all output files
    async closeBundle() {
      const distDir = path.join(__dirname, 'dist')
      const distIndexPath = path.join(distDir, 'index.html')

      if (!fs.existsSync(distIndexPath)) return

      // Read the fully-resolved dist/index.html and strip its home-page meta.
      // This gives us a clean base template with resolved asset hashes but no SEO tags.
      const baseHtml = stripExistingMeta(fs.readFileSync(distIndexPath, 'utf-8'))

      // ── Static routes ────────────────────────────────────────────
      for (const { route, title, description } of routeMeta) {
        if (route === '/') continue // already handled by transformIndexHtml

        const html = injectMeta(baseHtml, { title, description })
        const folder = path.join(distDir, route.slice(1))
        fs.mkdirSync(folder, { recursive: true })
        fs.writeFileSync(path.join(folder, 'index.html'), html, 'utf-8')
        console.log(`✅  Meta injected → dist${route}/index.html`)
      }

      // ── Blog posts (fetched from API at build time) ───────────────
      try {
        const API = process.env.VITE_JAVA_API_URL || 'https://javaapi.autopaneai.com/api'
        console.log('\n📡  Fetching blogs from API for meta injection…')

        // Step 1: get the list to collect all slugs
        const listRes = await fetch(`${API}/v1/blogs`)
        if (!listRes.ok) throw new Error(`Blog list API responded with ${listRes.status}`)
        const blogList = await listRes.json()
        const slugs = blogList.map((b) => b.slug).filter(Boolean)

        // Step 2: fetch each blog individually (in parallel) to get metaTitle/metaDescription
        const fullBlogs = await Promise.all(
          slugs.map((slug) =>
            fetch(`${API}/v1/blogs/${slug}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        )

        let count = 0
        for (const blog of fullBlogs) {
          if (!blog?.slug) continue

          // Strictly use metaTitle and metaDescription only — no fallbacks
          const title = blog.metaTitle
          const description = blog.metaDescription

          if (!title || !description) {
            console.warn(`⚠️  Skipping blog "${blog.slug}" — missing title or description from API`)
            continue
          }

          console.log(`   📝 title: ${title}`)
          console.log(`   📄 desc:  ${description}`)
          const html = injectMeta(baseHtml, { title, description })
          const folder = path.join(distDir, 'blogs', blog.slug)
          fs.mkdirSync(folder, { recursive: true })
          fs.writeFileSync(path.join(folder, 'index.html'), html, 'utf-8')
          console.log(`✅  Blog meta injected → dist/blogs/${blog.slug}/index.html`)
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
