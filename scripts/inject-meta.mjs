/**
 * inject-meta.mjs
 * Post-build script: copies dist/index.html into each public route folder
 * and injects the correct <title> and <meta name="description"> per route.
 * Run automatically via: npm run build  (see package.json "build" script)
 *
 * Zero dependencies — pure Node.js fs/path only.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const templatePath = path.join(distDir, 'index.html');

// ─── Per-route meta definitions ──────────────────────────────────────────────
const routes = [
    {
        path: '/',
        title: 'APAI | Smart Auto Glass Shop Management Software',
        description:
            'Scale your auto glass business with APAI. Automate quoting, invoicing, and NAGS pricing. The all-in-one AI platform built to grow your shop for only $99/mo.',
    },
    {
        path: '/features',
        title: 'APAI Features | Auto Glass Shop Automation Tools',
        description:
            'Explore APAI\'s powerful features: AI quoting, NAGS pricing, invoicing, scheduling, customer management and more — built specifically for auto glass shops.',
    },
    {
        path: '/pricing',
        title: 'APAI Pricing | Affordable Plans for Auto Glass Shops',
        description:
            'Simple, transparent pricing for APAI. Start automating your auto glass shop for just $99/mo. No hidden fees. Cancel anytime.',
    },
    {
        path: '/about',
        title: 'About APAI | The Auto Glass Shop Management Platform',
        description:
            'Learn about APAI — the team behind the smart auto glass shop management platform helping shops grow faster with AI-powered automation.',
    },
    {
        path: '/contact',
        title: 'Contact APAI | Get in Touch with Our Team',
        description:
            'Have questions about APAI? Contact our team for support, sales inquiries, or partnerships. We\'re here to help your auto glass shop succeed.',
    },
    {
        path: '/blogs',
        title: 'APAI Blog | Auto Glass Business Tips & Industry News',
        description:
            'Read the latest articles on auto glass shop management, industry trends, NAGS pricing tips, and business growth strategies from the APAI team.',
    },
    {
        path: '/auth',
        title: 'Sign In or Sign Up | APAI',
        description:
            'Sign in to your APAI account or create a new account to start managing your auto glass shop smarter.',
    },
    {
        path: '/privacy-policy',
        title: 'Privacy Policy | APAI',
        description:
            'Read the APAI Privacy Policy to understand how we collect, use, and protect your personal information.',
    },
    {
        path: '/terms-of-service',
        title: 'Terms of Service | APAI Auto Glass Management Software',
        description:
            "Review the terms and conditions for using APAI's AI-powered auto glass platform. Learn about subscriptions, usage rights, and our $99 service.",
    },
    {
        path: '/sitemap',
        title: 'Sitemap | APAI',
        description: 'Browse all pages on the APAI platform.',
    },
];
// ─────────────────────────────────────────────────────────────────────────────

if (!fs.existsSync(templatePath)) {
    console.error('❌  dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');

let injected = 0;

for (const route of routes) {
    const { path: routePath, title, description } = route;

    // Build the two tags we want to inject
    const titleTag = `<title>${title}</title>`;
    const descTag = `<meta name="description" content="${description}" />`;

    // Insert just before </head>
    const html = template
        .replace('</head>', `  ${titleTag}\n  ${descTag}\n</head>`);

    // Determine output folder: '/' → dist/index.html (already exists as template,
    // just overwrite); '/pricing' → dist/pricing/index.html
    let outputPath;
    if (routePath === '/') {
        outputPath = path.join(distDir, 'index.html');
    } else {
        const folder = path.join(distDir, routePath.slice(1)); // strip leading /
        fs.mkdirSync(folder, { recursive: true });
        outputPath = path.join(folder, 'index.html');
    }

    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`✅  ${routePath.padEnd(18)} → ${path.relative(distDir, outputPath)}`);
    injected++;
}

console.log(`\n🎉  Meta tags injected into ${injected} route(s).\n`);
