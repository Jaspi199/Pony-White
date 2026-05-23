const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mappings from Stitch prototype directories to output pages
const PAGE_MAPPINGS = [
  {
    dirName: 'pony_white_homepage_circular_logo_integration',
    fileName: 'home.html'
  },
  {
    dirName: 'pony_white_beans_loyalty_program',
    fileName: 'loyalty.html'
  },
  {
    dirName: 'pony_white_book_a_table',
    fileName: 'book-table.html'
  },
  {
    dirName: 'pony_white_gift_cards',
    fileName: 'gift-cards.html'
  },
  {
    dirName: 'pony_white_retail_coffee_beans',
    fileName: 'retail-top.html'
  },
  {
    dirName: 'pony_white_retail_coffee_beans',
    fileName: 'retail-bottom.html'
  },
  {
    dirName: 'careers_circular_logo_integration',
    fileName: 'careers.html'
  },
  {
    dirName: 'contact_feedback_circular_logo_integration',
    fileName: 'contact.html'
  },
  {
    dirName: 'signature_drinks_sharp_content_on_atmospheric_background',
    fileName: 'drinks.html'
  },
  {
    dirName: 'pony_white_smoothies_juices',
    fileName: 'smoothies-juices.html'
  }
];

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const STITCH_ROOT = path.join(ROOT_DIR, 'stitch_pony_white_cafe_web_design 2');
const PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const STYLES_DIR = path.join(ROOT_DIR, 'src', 'styles');

// Create directories if they don't exist
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
if (!fs.existsSync(STYLES_DIR)) fs.mkdirSync(STYLES_DIR, { recursive: true });

/**
 * Extracts page body content, discarding navbar and footer
 */
function extractBodyContent(rawHtml, pageName) {
  // 1. Find the <body> tag content
  const bodyMatch = rawHtml.match(/<body[^>]*>([^]*?)<\/body>/i);
  if (!bodyMatch) {
    console.warn(`  - Warning: No body tag found in raw HTML for ${pageName}. Using full file.`);
    return rawHtml;
  }
  
  let content = bodyMatch[1];
  
  // Custom splitting logic for split retail pages
  if (pageName === 'retail-top.html') {
    const parts = content.split(/<!--\s*Bottom\s+Code\s+Split\s*-->/i);
    content = parts[0];
    console.log(`  - Extracted TOP half of retail page`);
  } else if (pageName === 'retail-bottom.html') {
    const parts = content.split(/<!--\s*Bottom\s+Code\s+Split\s*-->/i);
    content = parts[1] || '';
    console.log(`  - Extracted BOTTOM half of retail page`);
  }

  // 2. Strip navbar tag
  if (pageName !== 'drinks.html') {
    const navMatch = content.match(/<nav[^>]*>[^]*?<\/nav>/gi);
    if (navMatch) {
      console.log(`  - Stripped top navigation bar (<nav>)`);
      content = content.replace(/<nav[^>]*>[^]*?<\/nav>/gi, '');
    }
  } else {
    console.log(`  - Preserved sidebar navigation menu (<nav>) for ${pageName}`);
  }
  
  // 3. Strip footer tag
  const footerMatch = content.match(/<footer[^>]*>[^]*?<\/footer>/gi);
  if (footerMatch) {
    console.log(`  - Stripped footer (<footer>)`);
    content = content.replace(/<footer[^>]*>[^]*?<\/footer>/gi, '');
  }
  
  return content.trim();
}

/**
 * Extracts all <style> tags and their contents
 */
function extractStyleContent(rawHtml) {
  const styleMatch = rawHtml.match(/<style[^>]*>[^]*?<\/style>/gi);
  if (!styleMatch) return '';
  return styleMatch.join('\n');
}

/**
 * Extracts and prepares the tailwind config module
 */
function extractTailwindConfig(rawHtml, pageName) {
  const configMatch = rawHtml.match(/<script\s+id=["']tailwind-config["'][^>]*>([^]*?)<\/script>/i);
  if (!configMatch) {
    console.log(`  - No custom tailwind config script found for ${pageName}. Using default.`);
    return null;
  }
  
  let configJs = configMatch[1].trim();
  
  // Clean up and convert tailwind.config = { ... } to module.exports = { ... }
  configJs = configJs.replace(/tailwind\.config\s*=\s*/g, 'module.exports = ');
  
  // Strip tailwind config template plugins if they reference raw CDN functions
  configJs = configJs.replace(/plugins:\s*\[[^\]]*\]/gi, '');
  
  // Inject premium design typography pairing: Playfair Display + Plus Jakarta Sans
  configJs = configJs.replace(/"fontFamily"\s*:\s*\{[^}]*\}/g, `"fontFamily": {
    "headline-xl-mobile": ["'Playfair Display'", "serif"],
    "headline-xl": ["'Playfair Display'", "serif"],
    "headline-md": ["'Playfair Display'", "serif"],
    "headline-lg": ["'Playfair Display'", "serif"],
    "body-md": ["'Plus Jakarta Sans'", "sans-serif"],
    "body-lg": ["'Plus Jakarta Sans'", "sans-serif"],
    "label-md": ["'Plus Jakarta Sans'", "sans-serif"],
    "label-sm": ["'Plus Jakarta Sans'", "sans-serif"]
  }`);
  
  return configJs;
}

/**
 * Runs the Tailwind CLI compiler to compile styles specifically for a page
 */
function compileTailwindCss(pageName, configFilePath, htmlFilePath, outputCssPath) {
  console.log(`  - Compiling Tailwind CSS for ${pageName}...`);
  
  const tailwindInput = path.join(STYLES_DIR, 'tailwind-input.css');
  
  // Build CLI command
  // Make sure we include /usr/local/bin in PATH
  const cmd = `npx tailwindcss -c "${configFilePath}" -i "${tailwindInput}" -o "${outputCssPath}" --content "${htmlFilePath}" --minify`;
  
  try {
    execSync(cmd, {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        PATH: '/usr/local/bin:' + (process.env.PATH || '')
      },
      stdio: 'pipe'
    });
    console.log(`  ✓ Successfully compiled CSS! Saved to: src/styles/${path.basename(outputCssPath)}`);
  } catch (error) {
    console.error(`  ✗ Error running Tailwind CSS compiler for ${pageName}:`, error.message);
    if (error.stderr) console.error(error.stderr.toString());
  }
}

/**
 * Process a single page
 */
function processPage(mapping) {
  const { dirName, fileName } = mapping;
  const pageName = fileName.replace('.html', '');
  const pageStitchDir = path.join(STITCH_ROOT, dirName);
  
  console.log(`\n=============================================`);
  console.log(`Processing: ${dirName} -> ${fileName}`);
  console.log(`=============================================`);
  
  if (!fs.existsSync(pageStitchDir)) {
    console.error(`Error: Stitch directory does not exist at ${pageStitchDir}`);
    return;
  }
  
  const rawHtmlPath = path.join(pageStitchDir, 'code.html');
  if (!fs.existsSync(rawHtmlPath)) {
    console.error(`Error: code.html does not exist in ${pageStitchDir}`);
    return;
  }
  
  const rawHtml = fs.readFileSync(rawHtmlPath, 'utf8');
  
  // 1. Extract body content (discard navbar/footer)
  const bodyContent = extractBodyContent(rawHtml, fileName);
  const styleContent = extractStyleContent(rawHtml);
  
  // 2. Pre-pend the stylesheet reference so compiler.js inlines it
  const pageCssName = `${pageName}.css`;
  const headerSection = `<!-- Compiled custom embed section for ${fileName} -->\n` +
    `<link rel="preconnect" href="https://fonts.googleapis.com">\n` +
    `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n` +
    `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">\n` +
    `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>\n` +
    `<link rel="stylesheet" href="../styles/${pageCssName}">\n\n`;
  const finalSourceHtml = headerSection + styleContent + '\n\n' + bodyContent;
  
  const targetHtmlPath = path.join(PAGES_DIR, fileName);
  fs.writeFileSync(targetHtmlPath, finalSourceHtml, 'utf8');
  console.log(`  ✓ Saved extracted source markup to: src/pages/${fileName}`);
  
  // 3. Extract Tailwind config
  const configJs = extractTailwindConfig(rawHtml, fileName);
  const tempConfigPath = path.join(ROOT_DIR, `tailwind.config.${pageName}.temp.js`);
  
  let configContent = '';
  if (configJs) {
    configContent = configJs;
  } else {
    // Default fallback config if none exists
    configContent = `module.exports = { theme: { extend: {} } };`;
  }
  
  fs.writeFileSync(tempConfigPath, configContent, 'utf8');
  
  // 4. Run Tailwind CLI compile
  const targetCssPath = path.join(STYLES_DIR, pageCssName);
  compileTailwindCss(fileName, tempConfigPath, targetHtmlPath, targetCssPath);
  
  // Clean up temporary config file
  try {
    fs.unlinkSync(tempConfigPath);
  } catch (e) {
    // ignore
  }
}

/**
 * Main execution
 */
function run() {
  console.log('Starting Ponywhite Page Extraction & Tailwind compilation...');
  
  if (!fs.existsSync(STITCH_ROOT)) {
    console.error(`Stitch root directory does not exist at ${STITCH_ROOT}`);
    process.exit(1);
  }
  
  PAGE_MAPPINGS.forEach(mapping => {
    processPage(mapping);
  });
  
  console.log('\n=============================================');
  console.log('PAGE EXTRACTION AND CSS PRE-COMPILATION COMPLETE!');
  console.log('=============================================');
}

run();
