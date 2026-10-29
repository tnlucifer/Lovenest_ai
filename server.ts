import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Support payloads for gifts up to 50MB (handles photos & audio)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Dedicated server-side storage directory for gifts
const DATA_DIR = path.resolve(process.cwd(), 'data');
const GIFTS_FILE = path.resolve(DATA_DIR, 'gifts.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readAllGifts(): Record<string, any> {
  try {
    if (!fs.existsSync(GIFTS_FILE)) {
      return {};
    }
    const content = fs.readFileSync(GIFTS_FILE, 'utf-8');
    return JSON.parse(content) || {};
  } catch (err) {
    console.warn('Notice reading gifts file:', err);
    return {};
  }
}

function writeAllGifts(gifts: Record<string, any>) {
  try {
    fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing gifts file:', err);
  }
}

// GET /api/gifts/:id - fetch customized gift by ID or slug
app.get('/api/gifts/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Gift ID required' });
  }

  const cleanId = id.trim();
  const gifts = readAllGifts();

  // Match by exact ID, lowercase ID, or uniqueSlug
  const gift = gifts[cleanId] || 
               gifts[cleanId.toLowerCase()] || 
               Object.values(gifts).find((g: any) => g.uniqueSlug === cleanId || g.id === cleanId);

  if (gift) {
    return res.json({ success: true, gift });
  }

  return res.status(404).json({ success: false, error: 'Gift not found' });
});

// POST /api/gifts - save/update customized gift
app.post('/api/gifts', (req, res) => {
  const gift = req.body;
  if (!gift || !gift.id) {
    return res.status(400).json({ success: false, error: 'Valid gift with id is required' });
  }

  const gifts = readAllGifts();
  const updatedGift = {
    ...gift,
    published: true,
    updatedAt: new Date().toISOString()
  };

  gifts[gift.id] = updatedGift;
  if (gift.uniqueSlug && gift.uniqueSlug !== gift.id) {
    gifts[gift.uniqueSlug] = updatedGift;
  }

  writeAllGifts(gifts);
  return res.json({ success: true, gift: updatedGift });
});

// DELETE /api/gifts/:id - delete gift
app.delete('/api/gifts/:id', (req, res) => {
  const { id } = req.params;
  const gifts = readAllGifts();
  if (gifts[id]) {
    delete gifts[id];
    writeAllGifts(gifts);
  }
  return res.json({ success: true });
});

// POST /api/gifts/:id/reaction - increment reaction
app.post('/api/gifts/:id/reaction', (req, res) => {
  const { id } = req.params;
  const gifts = readAllGifts();
  const gift = gifts[id];
  if (gift) {
    gift.reactionsCount = (gift.reactionsCount || 0) + 1;
    writeAllGifts(gifts);
    return res.json({ success: true, count: gift.reactionsCount });
  }
  return res.json({ success: true, count: 1 });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distDir = path.resolve(process.cwd(), 'dist');

  if (isProd && fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LoveNest server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
