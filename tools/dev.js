const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const liveServer = require('live-server');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('=============================================');
console.log('  PONYWHITE CAFE DEVELOPMENT WORKSPACE');
console.log('=============================================');

// Debounce helper to prevent double compilations
let compileTimeout = null;

function compile() {
  console.log('\n[Watcher] Changes detected! Recompiling...');
  try {
    // 1. Run Tailwind Compilation
    execSync('node tools/compile-tailwind.js', {
      cwd: ROOT_DIR,
      env: { ...process.env, PATH: '/usr/local/bin:' + (process.env.PATH || '') },
      stdio: 'inherit'
    });
    
    // 2. Run Style Inliner Compiler
    execSync('node tools/compiler.js', {
      cwd: ROOT_DIR,
      env: { ...process.env, PATH: '/usr/local/bin:' + (process.env.PATH || '') },
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('[Watcher] Compilation failed:', err.message);
  }
}

// Watch /src directory recursively
if (fs.existsSync(SRC_DIR)) {
  console.log(`[Watcher] Watching files under: /src`);
  fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && (filename.endsWith('.html') || filename.endsWith('.css'))) {
      if (compileTimeout) clearTimeout(compileTimeout);
      compileTimeout = setTimeout(compile, 250);
    }
  });
} else {
  console.error(`Error: Source directory ${SRC_DIR} does not exist.`);
}

// Start Live Server
const params = {
  port: 8080,
  host: "127.0.0.1",
  root: ROOT_DIR, // Serve from root so paths to /src and /square_embeds work
  open: "/index.html", // Automatically open dashboard
  file: "index.html",
  wait: 500,
  logLevel: 1 // Only show errors and main logs
};

console.log(`[Server] Starting live reload dev server at http://127.0.0.1:8080...`);
liveServer.start(params);
