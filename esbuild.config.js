import * as esbuild from 'esbuild';
import { WebSocketServer } from 'ws';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import { readFile } from 'fs/promises';
import chokidar from 'chokidar';

const isProduction = process.argv.includes('--build');
const port = 3000;
const wsPort = 3001;

// WebSocket server for live reload
let wss;
const clients = new Set();

if (!isProduction) {
  wss = new WebSocketServer({ port: wsPort });
  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });
  console.log(`WebSocket server running on ws://localhost:${wsPort}`);
}

// Notify all clients to reload
function notifyClients(reason = '') {
  if (reason) console.log(reason);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send('reload');
    }
  });
}

// PostCSS plugin for esbuild
const postcssPlugin = {
  name: 'postcss',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await readFile(args.path, 'utf8');
      const result = await postcss([tailwindcss()]).process(css, {
        from: args.path,
      });
      return {
        contents: result.css,
        loader: 'css',
      };
    });
  },
};

// Live reload plugin
const liveReloadPlugin = {
  name: 'live-reload',
  setup(build) {
    build.onEnd(() => {
      if (!isProduction) {
        notifyClients('Build complete, reloading...');
      }
    });
  },
};

const buildOptions = {
  entryPoints: ['src/main.js', 'src/styles.css'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  splitting: true,
  plugins: [postcssPlugin, !isProduction && liveReloadPlugin].filter(Boolean),
  logLevel: 'info',
  sourcemap: !isProduction,
  minify: isProduction,
};

if (isProduction) {
  // Production build
  await esbuild.build(buildOptions);
  console.log('Production build complete!');
} else {
  // Development mode with watch
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');

  // Serve files
  await ctx.serve({
    servedir: '.',
    port: port,
  });

  // Watch HTML and src files for changes
  chokidar.watch(['index.html', 'src/**/*.{css,js,ts,jsm,jsx}'], {
    ignoreInitial: true,
  }).on('change', (path) => {
    notifyClients(`${path} changed, reloading...`);
  });

  console.log(`\n🚀 Development server running at http://localhost:${port}\n`);
  console.log('Files being served:');
  console.log(`  - http://localhost:${port}/index.html`);
  console.log(`  - http://localhost:${port}/dist/main.js`);
  console.log(`  - http://localhost:${port}/dist/styles.css\n`);
  console.log('📡 Live reload enabled');
  console.log('   - Watching: index.html, src/**/*.{css,js,ts,jsm,jsx}\n');
}
