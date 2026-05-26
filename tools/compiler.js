const fs = require('fs');
const path = require('path');
const juice = require('juice');

// Configuration
// You can customize your GitHub Username and Repository name here
const CONFIG = {
  githubUsername: 'Jaspi199', // Default fallback, can be updated by user
  githubRepo: 'Pony-White',
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
  const assetRegex = /(?:url\(["']?|src=["']|href=["']|["'])(?:\.\.\/|\.\/|\/)*assets\/([^"'\)]+)(?:["']?\)|\s*["'])/gi;
  
  return html.replace(assetRegex, (match) => {
    // Determine delimiter (src=", href=", url(', url(), or standard quote)
    let prefix = '';
    let suffix = '';
    
    if (match.toLowerCase().startsWith('src=')) {
      const quote = match.includes('"') ? '"' : "'";
      prefix = `src=${quote}`;
      suffix = quote;
    } else if (match.toLowerCase().startsWith('href=')) {
      const quote = match.includes('"') ? '"' : "'";
      prefix = `href=${quote}`;
      suffix = quote;
    } else if (match.toLowerCase().startsWith('url(')) {
      const quote = match.includes('"') ? '"' : (match.includes("'") ? "'" : "");
      prefix = `url(${quote}`;
      suffix = `${quote})`;
    } else if (match.startsWith('"') || match.startsWith("'")) {
      const quote = match[0];
      prefix = quote;
      suffix = quote;
    }

    // Extract the actual filename
    const parts = match.split(/assets\//i);
    if (parts.length < 2) return match;
    
    // Clean up filename from trailing quotes/parentheses
    let filename = parts[1];
    filename = filename.replace(/['"\)]+$/, '').trim();

    const targetBase = useCDN ? CDN_BASE_URL : `/${LOCAL_ASSETS_PATH}`;
    
    // URL-encode spaces in filename (e.g. "strawberrys and cream.mp4" -> "strawberrys%20and%20cream.mp4")
    const encodedFilename = filename.replace(/\s/g, '%20');
    
    return `${prefix}${targetBase}${encodedFilename}${suffix}`;
  });
}

/**
 * Simple, robust HTML minifier that strips comments, newlines, and excess whitespace.
 * Safe for standard HTML templates, inline styles, and embedded scripts.
 * Specifically avoids stripping newlines from <script> blocks to preserve single-line comments.
 */
function minifyHtml(html) {
  // 1. Temporarily extract all script blocks so their formatting is preserved
  const scripts = [];
  let minified = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
    scripts.push(match);
    return `<!--SCRIPT_PLACEHOLDER_${scripts.length - 1}-->`;
  });

  // 2. Minify the HTML markup around the placeholders
  minified = minified
    // Remove HTML comments, preserving IE conditional comments and our script placeholders
    .replace(/<!--(?!\[if|SCRIPT_PLACEHOLDER_)([^]*?)-->/g, '')
    // Collapse all vertical whitespace (newlines, carriage returns) into single spaces
    .replace(/[\r\n\t]+/g, ' ')
    // Collapse multiple spaces into a single space
    .replace(/\s{2,}/g, ' ')
    // Remove whitespace between tags where safe
    .replace(/>\s+</g, '><')
    .trim();

  // 3. Re-insert the original script blocks with formatting intact
  minified = minified.replace(/<!--SCRIPT_PLACEHOLDER_(\d+)-->/g, (match, index) => {
    return scripts[parseInt(index, 10)];
  });

  return minified;
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
  
  // Prepend robust font @imports, global typography resets, and compiled styles inside a clean style block at the top of the content.
  // Placing combinedCss directly inside this block retains 100% of responsive design layouts (media queries),
  // hover states, and animations natively, eliminating layout conflicts in sandboxed iframes.
  const globalStyles = `<style>\n` +
                       `  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');\n` +
                       `  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');\n\n` +
                       `  /* Global Typography resets to bypass sandboxed iframe font blocks */\n` +
                       `  body, html, * {\n` +
                       `    font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif !important;\n` +
                       `  }\n` +
                       `  .material-symbols-outlined,\n` +
                       `  .material-symbols-outlined * {\n` +
                       `    font-family: 'Material Symbols Outlined' !important;\n` +
                       `  }\n` +
                       `  .font-serif, h1, .font-headline-xl, .font-headline-md, .font-headline-lg, .font-headline-xl-mobile {\n` +
                       `    font-family: 'Playfair Display', ui-serif, Georgia, Cambria, serif !important;\n` +
                       `  }\n\n` +
                       `  /* Compiled Page Styles */\n` +
                       `  ${combinedCss}\n` +
                       `</style>\n`;
  const inlinedHtml = globalStyles + html;

  // 2. Process image/asset paths
  console.log(`  - Processing asset paths (CDN: ${CONFIG.useCDN ? 'ENABLED' : 'DISABLED'})...`);
  let processedHtml = processAssetPaths(inlinedHtml, CONFIG.useCDN);
  
  // Inject dynamic script fonts loading to guarantee bypass of iframe sandboxing limits
  const dynamicFontScript = `\n    // Dynamic Font Injection to bypass iframe sandboxing font blocks\n` +
                            `    (function() {\n` +
                            `      function injectFont(url) {\n` +
                            `        if (document.querySelector('link[href="' + url + '"]')) return;\n` +
                            `        const link = document.createElement('link');\n` +
                            `        link.rel = 'stylesheet';\n` +
                            `        link.href = url;\n` +
                            `        document.head.appendChild(link);\n` +
                            `      }\n` +
                            `      injectFont('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');\n` +
                            `      injectFont('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');\n` +
                            `    })();\n`;
                            
  processedHtml = processedHtml.replace(/<script[^>]*>/i, (match) => {
    return `${match}${dynamicFontScript}`;
  });
  
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
