const fs = require('fs');
const path = require('path');
const juice = require('juice');

// Configuration
// You can customize your GitHub Username and Repository name here
const CONFIG = {
  githubUsername: 'ignaciotoro', // Default fallback, can be updated by user
  githubRepo: 'Ponywhite',
  githubBranch: 'main',
  useCDN: true // Set to false during local development to use local paths
};

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const STYLES_DIR = path.join(ROOT_DIR, 'src', 'styles');
const OUTPUT_DIR = path.join(ROOT_DIR, 'square_embeds');

// Make sure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate CDN base URL
const CDN_BASE_URL = `https://cdn.jsdelivr.net/gh/${CONFIG.githubUsername}/${CONFIG.githubRepo}@${CONFIG.githubBranch}/assets/`;
const LOCAL_ASSETS_PATH = 'assets/';

/**
 * Replaces local asset paths with CDN URLs or normalized local paths
 * Supports formats like: ../../assets/img.png, /assets/img.png, assets/img.png
 */
function processAssetPaths(html, useCDN) {
  const assetRegex = /(?:url\(["']?|src=["']|href=["'])(?:\.\.\/|\.\/|\/)*assets\/([^"'\)\s]+)(?:["']?\)|\s*["'])/gi;
  
  return html.replace(assetRegex, (match) => {
    // Determine delimiter (src=", href=", url(', url()
    let prefix = '';
    let suffix = '';
    let cleanMatch = match;
    
    if (match.toLowerCase().startsWith('src=')) {
      const quote = match.includes('"') ? '"' : "'";
      prefix = `src=${quote}`;
      suffix = quote;
    } else if (match.toLowerCase().startsWith('href=')) {
      const quote = match.includes('"') ? '"' : "'";
      prefix = `href=${quote}`;
      suffix = quote;
    } else if (match.toLowerCase().startsWith('url(')) {
      const hasQuote = match.includes('"') || match.includes("'");
      const quote = match.includes('"') ? '"' : (match.includes("'") ? "'" : "");
      prefix = `url(${quote}`;
      suffix = `${quote})`;
    }

    // Extract the actual filename
    const parts = match.split(/assets\//i);
    if (parts.length < 2) return match;
    
    // Clean up filename from trailing quotes/parentheses
    let filename = parts[1];
    filename = filename.replace(/['"\)]+$/, '').trim();

    const targetBase = useCDN ? CDN_BASE_URL : `/${LOCAL_ASSETS_PATH}`;
    return `${prefix}${targetBase}${filename}${suffix}`;
  });
}

/**
 * Simple, robust HTML minifier that strips comments, newlines, and excess whitespace.
 * Safe for standard HTML templates and inline styles.
 */
function minifyHtml(html) {
  return html
    // 1. Remove HTML comments, except IE conditional comments (not relevant here but good practice)
    .replace(/<!--(?!\[if)([^]*?)-->/g, '')
    // 2. Collapse all vertical whitespace (newlines, carriage returns) into single spaces
    .replace(/[\r\n\t]+/g, ' ')
    // 3. Collapse multiple spaces into a single space
    .replace(/\s{2,}/g, ' ')
    // 4. Remove whitespace between tags where safe
    .replace(/>\s+</g, '><')
    .trim();
}

/**
 * Core compiler function
 */
function compilePage(filePath) {
  const pageName = path.basename(filePath);
  console.log(`\nCompiling: ${pageName}...`);
  
  let html = fs.readFileSync(filePath, 'utf8');
  
  // 1. Handle CSS Inlining
  // We'll look for linked stylesheets in the HTML and resolve them locally
  const stylesheetRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  let combinedCss = '';
  const linksToRemove = [];
  
  // Read and combine all external CSS files referenced in the page
  while ((match = stylesheetRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const cssRelPath = match[1];
    
    // Skip external stylesheets (Google Fonts, CDNs, etc.)
    if (cssRelPath.startsWith('http') || cssRelPath.startsWith('//') || cssRelPath.includes('fonts.googleapis.com')) {
      console.log(`  - Found external stylesheet (preserving): ${cssRelPath}`);
      continue;
    }
    
    // Resolve CSS path relative to the HTML page
    const cssAbsPath = path.resolve(path.dirname(filePath), cssRelPath);
    
    if (fs.existsSync(cssAbsPath)) {
      console.log(`  - Found and combining stylesheet: ${path.basename(cssAbsPath)}`);
      combinedCss += fs.readFileSync(cssAbsPath, 'utf8') + '\n';
      linksToRemove.push(fullTag);
    } else {
      console.warn(`  - Warning: Referenced stylesheet not found at ${cssAbsPath}`);
    }
  }
  
  // Remove only the inlined local <link> tags from the HTML structure
  linksToRemove.forEach(tag => {
    html = html.replace(tag, '');
  });
  
  // Inline the compiled styles using Juice
  let inlinedHtml = html;
  if (combinedCss.trim().length > 0) {
    console.log(`  - Inlining combined CSS styles...`);
    inlinedHtml = juice.inlineContent(html, combinedCss, {
      removeStyleTags: true,
      preserveMediaQueries: true
    });
  } else {
    console.log(`  - No external stylesheets found to inline.`);
  }

  // 2. Process image/asset paths
  console.log(`  - Processing asset paths (CDN: ${CONFIG.useCDN ? 'ENABLED' : 'DISABLED'})...`);
  let processedHtml = processAssetPaths(inlinedHtml, CONFIG.useCDN);
  
  // 3. Minify HTML
  console.log(`  - Minifying output...`);
  const minifiedHtml = minifyHtml(processedHtml);
  
  // 4. Write output to square_embeds directory
  const outputFileName = pageName;
  const outputPath = path.join(OUTPUT_DIR, outputFileName);
  fs.writeFileSync(outputPath, minifiedHtml, 'utf8');
  
  // Stats
  const originalSize = Buffer.byteLength(html, 'utf8');
  const compiledSize = Buffer.byteLength(minifiedHtml, 'utf8');
  const reduction = ((originalSize - compiledSize) / originalSize * 100).toFixed(1);
  
  console.log(`  ✓ Success! Saved compiled file to /square_embeds/${outputFileName}`);
  console.log(`    Original size: ${originalSize} bytes`);
  console.log(`    Compiled size: ${compiledSize} bytes (${reduction}% smaller)`);
}

/**
 * Main function to build all pages
 */
function buildAll() {
  console.log('=============================================');
  console.log('  PONYWHITE SQUARE EMBED COMPILER');
  console.log('=============================================');
  console.log(`Target Repo CDN: ${CDN_BASE_URL}`);

  if (!fs.existsSync(PAGES_DIR)) {
    console.error(`Error: Pages directory does not exist at ${PAGES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PAGES_DIR);
  const htmlFiles = files.filter(f => f.endsWith('.html'));

  if (htmlFiles.length === 0) {
    console.log('\nNo HTML pages found in src/pages/. Add pages to compile!');
    console.log('Creating a placeholder home.html page for testing...');
    createPlaceholderPage();
    return;
  }

  htmlFiles.forEach(file => {
    compilePage(path.join(PAGES_DIR, file));
  });

  console.log('\n=============================================');
  console.log('  BUILD COMPLETE!');
  console.log('=============================================');
}

/**
 * Helper to generate a nice demo page to verify the system works
 */
function createPlaceholderPage() {
  // Ensure styles folder exists
  if (!fs.existsSync(STYLES_DIR)) {
    fs.mkdirSync(STYLES_DIR, { recursive: true });
  }

  const placeholderCss = `
/* Theme base */
.pw-section {
  font-family: 'Outfit', sans-serif;
  background-color: #0b0f19;
  color: #f8fafc;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pw-hero-card {
  max-width: 600px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.pw-title {
  font-size: 42px;
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  font-weight: 700;
}

.pw-desc {
  font-size: 18px;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
}

.pw-btn {
  display: inline-block;
  background-color: #6366f1;
  color: #ffffff;
  padding: 14px 28px;
  border-radius: 9999px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.pw-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 24px;
  border: 2px solid #6366f1;
}
`;

  const placeholderHtml = `<!-- This is a fragment ready to compile for Square embeds. No <html>, <head> or <body> tags! -->
<link rel="stylesheet" href="../styles/theme.css">

<section class="pw-section">
  <div class="pw-hero-card">
    <img src="../../assets/logo.png" class="pw-image" alt="Ponywhite Logo">
    <h1 class="pw-title">Ponywhite</h1>
    <p class="pw-desc">A premium modern website shell compiled directly into custom inlined, single-line Square embeds.</p>
    <a href="https://square.link" class="pw-btn">Explore Menu</a>
  </div>
</section>
`;

  fs.writeFileSync(path.join(STYLES_DIR, 'theme.css'), placeholderCss.trim(), 'utf8');
  fs.writeFileSync(path.join(PAGES_DIR, 'home.html'), placeholderHtml.trim(), 'utf8');
  
  console.log('  ✓ Created src/styles/theme.css');
  console.log('  ✓ Created src/pages/home.html');
  
  // Re-run compilation now that we have files
  const htmlFiles = ['home.html'];
  htmlFiles.forEach(file => {
    compilePage(path.join(PAGES_DIR, file));
  });

  console.log('\n=============================================');
  console.log('  BUILD COMPLETE!');
  console.log('=============================================');
}

// Run the compiler!
buildAll();
