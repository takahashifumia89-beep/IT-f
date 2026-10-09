import { Hono, type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  ADMIN_PASSWORD: string; // wrangler secret
  SESSION_SECRET: string; // wrangler secret (кемінде 32 таңба)
};
type Ctx = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();

const SESSION_TTL = 60 * 60 * 12; // 12 сағат
const COOKIE = 'admin_session';
const enc = new TextEncoder();

/* ---------------------------------- крипто --------------------------------- */

const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');

async function sha256(s: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

function safeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(payload)));
}

async function makeToken(secret: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  return `${exp}.${await sign(`admin.${exp}`, secret)}`;
}

async function verifyToken(token: string | undefined, secret: string) {
  if (!token) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || !sig || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await sign(`admin.${exp}`, secret);
  return safeEqual(enc.encode(sig), enc.encode(expected));
}

async function ipHash(c: Ctx) {
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  return toHex((await sha256(ip + c.env.SESSION_SECRET)).buffer as ArrayBuffer).slice(0, 32);
}

async function rateLimit(db: D1Database, key: string, max: number, windowSec: number) {
  const now = Math.floor(Date.now() / 1000);
  if (Math.random() < 0.02) {
    await db.prepare('DELETE FROM rate_limits WHERE reset_at < ?').bind(now).run();
  }
  const row = await db
    .prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?')
    .bind(key)
    .first<{ count: number; reset_at: number }>();
  if (!row || row.reset_at <= now) {
    await db
      .prepare('INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)')
      .bind(key, now + windowSec)
      .run();
    return true;
  }
  if (row.count >= max) return false;
  await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run();
  return true;
}

/* ------------------------------- middleware -------------------------------- */

// Сервер дұрыс бапталмаған болса — қауіпсіз түрде тоқтаймыз
app.use('/api/*', async (c, next) => {
  if (!c.env.ADMIN_PASSWORD || !c.env.SESSION_SECRET || c.env.SESSION_SECRET.length < 32) {
    return c.json({ error: 'Сервер бапталмаған: ADMIN_PASSWORD / SESSION_SECRET орнатылмаған' }, 500);
  }
  await next();
});

// CSRF: басқа сайттан келген жазу сұраныстарын тоқтату
app.use('/api/*', async (c, next) => {
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    const origin = c.req.header('Origin');
    if (origin && new URL(origin).host !== new URL(c.req.url).host) {
      return c.json({ error: 'Рұқсат жоқ' }, 403);
    }
  }
  c.header('Cache-Control', 'no-store');
  await next();
});

// Админ маршруттары (login/logout-тан басқасы) — тек жарамды сессиямен
app.use('/api/admin/*', async (c, next) => {
  const p = new URL(c.req.url).pathname;
  if (p === '/api/admin/login' || p === '/api/admin/logout') return next();
  if (!(await verifyToken(getCookie(c, COOKIE), c.env.SESSION_SECRET))) {
    return c.json({ error: 'Кіру қажет' }, 401);
  }
  await next();
});

/* ------------------------------ валидация ---------------------------------- */

type FieldType = 's' | 'n' | 'url';
const TABLES: Record<string, Record<string, [FieldType, number]>> = {
  news: { title: ['s', 300], date: ['s', 100], content: ['s', 10000] },
  olympiads: { name: ['s', 300], date: ['s', 100], location: ['s', 300], registration: ['s', 500] },
  schedule_pdfs: { title: ['s', 300], fileName: ['s', 300], fileUrl: ['url', 2000], uploadDate: ['s', 100] },
  top_students: {
    rank: ['n', 0], name: ['s', 200], grade: ['s', 50],
    gpa: ['n', 0], achievements: ['n', 0], specialty: ['s', 200],
  },
  forum_posts: {
    author: ['s', 100], title: ['s', 300], content: ['s', 10000], timestamp: ['s', 40], likes: ['n', 0],
  },
};
const OPTIONAL = new Set(['registration', 'fileName', 'uploadDate']);
const DEFAULTS: Record<string, () => Record<string, unknown>> = {
  forum_posts: () => ({ author: 'Admin', timestamp: new Date().toISOString(), likes: 0 }),
};

function clean(
  table: string, body: any, partial: boolean,
): { cols: string[]; vals: unknown[] } | { error: string } {
  const spec = TABLES[table];
  const defaults = DEFAULTS[table]?.() ?? {};
  const cols: string[] = [];
  const vals: unknown[] = [];
  for (const [col, [type, max]] of Object.entries(spec)) {
    let v = body?.[col];
    const missing = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    if (missing) {
      if (partial) continue;
      if (col in defaults) v = defaults[col];
      else if (OPTIONAL.has(col)) v = '';
      else return { error: `"${col}" өрісі міндетті` };
    }
    if (type === 'n') {
      v = Number(v);
      if (!Number.isFinite(v)) return { error: `"${col}" сан болуы керек` };
    } else {
      v = String(v).trim();
      if ((v as string).length > max) return { error: `"${col}" тым ұзын (макс ${max})` };
      if (type === 'url' && !/^https?:\/\//i.test(v as string)) {
        return { error: 'Сілтеме http:// немесе https:// деп басталуы керек' };
      }
    }
    cols.push(col);
    vals.push(v);
  }
  if (!cols.length) return { error: 'Өзгеретін өріс жоқ' };
  return { cols, vals };
}

const readJson = (c: Ctx) => c.req.json().catch(() => null);

/* --------------------------------- ашық API -------------------------------- */

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.get('/api/data', async (c) => {
  const db = c.env.DB;
  const [news, olym, pdfs, students, posts, replies] = await db.batch([
    db.prepare('SELECT * FROM news ORDER BY date DESC, id DESC LIMIT 200'),
    db.prepare('SELECT * FROM olympiads ORDER BY date DESC, id DESC LIMIT 200'),
    db.prepare('SELECT * FROM schedule_pdfs ORDER BY id DESC LIMIT 100'),
    db.prepare('SELECT * FROM top_students ORDER BY rank ASC LIMIT 100'),
    db.prepare('SELECT * FROM forum_posts ORDER BY timestamp DESC LIMIT 200'),
    db.prepare('SELECT * FROM forum_replies ORDER BY id ASC LIMIT 3000'),
  ]);
  const byPost = new Map<number, any[]>();
  for (const r of replies.results as any[]) {
    const list = byPost.get(r.post_id) ?? [];
    list.push({ id: r.id, author: r.author, content: r.content, timestamp: r.timestamp });
    byPost.set(r.post_id, list);
  }
  return c.json({
    news: news.results,
    olympiads: olym.results,
    schedulePDFs: pdfs.results,
    topStudents: students.results,
    forumPosts: (posts.results as any[]).map((p) => ({ ...p, replies: byPost.get(p.id) ?? [] })),
  });
});

const RESERVED_NAME = /^\s*(admin|админ|administrator|модератор|moderator)/i;

app.post('/api/forum/posts', async (c) => {
  const body = await readJson(c);
  const author = String(body?.author ?? '').trim();
  const title = String(body?.title ?? '').trim();
  const content = String(body?.content ?? '').trim();
  if (!author || !title || !content) return c.json({ error: 'Барлық өрістерді толтырыңыз' }, 400);
  if (author.length > 100 || title.length > 200 || content.length > 5000) {
    return c.json({ error: 'Мәтін тым ұзын' }, 400);
  }
  if (RESERVED_NAME.test(author)) return c.json({ error: 'Бұл атты қолдануға болмайды' }, 400);
  if (!(await rateLimit(c.env.DB, `post:${await ipHash(c)}`, 5, 600))) {
    return c.json({ error: 'Тым жиі жазып жатырсыз. Бірнеше минуттан кейін қайталаңыз.' }, 429);
  }
  const r = await c.env.DB
    .prepare('INSERT INTO forum_posts (author, title, content, timestamp, likes) VALUES (?, ?, ?, ?, 0)')
    .bind(author, title, content, new Date().toISOString())
    .run();
  return c.json({ id: r.meta.last_row_id }, 201);
});

app.post('/api/forum/posts/:id/replies', async (c) => {
  const id = Number(c.req.param('id'));
  const body = await readJson(c);
  const content = String(body?.content ?? '').trim();
  const author = String(body?.author ?? '').trim() || 'Қонақ';
  if (!Number.isInteger(id) || !content) return c.json({ error: 'Жауап бос болмауы керек' }, 400);
  if (content.length > 2000 || author.length > 100) return c.json({ error: 'Мәтін тым ұзын' }, 400);
  if (RESERVED_NAME.test(author)) return c.json({ error: 'Бұл атты қолдануға болмайды' }, 400);
  if (!(await rateLimit(c.env.DB, `reply:${await ipHash(c)}`, 10, 600))) {
    return c.json({ error: 'Тым жиі жазып жатырсыз. Бірнеше минуттан кейін қайталаңыз.' }, 429);
  }
  const exists = await c.env.DB.prepare('SELECT id FROM forum_posts WHERE id = ?').bind(id).first();
  if (!exists) return c.json({ error: 'Пост табылмады' }, 404);
  const r = await c.env.DB
    .prepare('INSERT INTO forum_replies (post_id, author, content, timestamp) VALUES (?, ?, ?, ?)')
    .bind(id, author, content, new Date().toISOString())
    .run();
  return c.json({ id: r.meta.last_row_id }, 201);
});

app.post('/api/forum/posts/:id/like', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id)) return c.json({ error: 'Қате id' }, 400);
  const exists = await c.env.DB.prepare('SELECT id FROM forum_posts WHERE id = ?').bind(id).first();
  if (!exists) return c.json({ error: 'Пост табылмады' }, 404);
  const ins = await c.env.DB
    .prepare('INSERT OR IGNORE INTO forum_likes (post_id, ip_hash) VALUES (?, ?)')
    .bind(id, await ipHash(c))
    .run();
  if (ins.meta.changes > 0) {
    await c.env.DB.prepare('UPDATE forum_posts SET likes = likes + 1 WHERE id = ?').bind(id).run();
  }
  return c.json({ ok: true, alreadyLiked: ins.meta.changes === 0 });
});

/* --------------------------------- админ API ------------------------------- */

app.post('/api/admin/login', async (c) => {
  const db = c.env.DB;
  if (!(await rateLimit(db, `login:${await ipHash(c)}`, 5, 600))) {
    return c.json({ error: 'Тым көп әрекет. 10 минуттан кейін қайталаңыз.' }, 429);
  }
  const body = await readJson(c);
  const given = await sha256(String(body?.password ?? ''));
  const real = await sha256(c.env.ADMIN_PASSWORD);
  if (!safeEqual(given, real)) return c.json({ error: 'Құпия сөз қате' }, 401);

  setCookie(c, COOKIE, await makeToken(c.env.SESSION_SECRET), {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Strict',
    path: '/',
    maxAge: SESSION_TTL,
  });
  return c.json({ ok: true });
});

app.post('/api/admin/logout', (c) => {
  deleteCookie(c, COOKIE, { path: '/' });
  return c.json({ ok: true });
});

app.get('/api/admin/me', (c) => c.json({ ok: true }));

app.post('/api/admin/:table', async (c) => {
  const table = c.req.param('table');
  if (!TABLES[table]) return c.json({ error: 'Кесте табылмады' }, 404);
  const res = clean(table, await readJson(c), false);
  if ('error' in res) return c.json({ error: res.error }, 400);
  const r = await c.env.DB
    .prepare(`INSERT INTO ${table} (${res.cols.join(', ')}) VALUES (${res.cols.map(() => '?').join(', ')})`)
    .bind(...res.vals)
    .run();
  return c.json({ id: r.meta.last_row_id }, 201);
});

app.put('/api/admin/:table/:id', async (c) => {
  const table = c.req.param('table');
  const id = Number(c.req.param('id'));
  if (!TABLES[table] || !Number.isInteger(id)) return c.json({ error: 'Қате сұраныс' }, 400);
  const res = clean(table, await readJson(c), true);
  if ('error' in res) return c.json({ error: res.error }, 400);
  await c.env.DB
    .prepare(`UPDATE ${table} SET ${res.cols.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
    .bind(...res.vals, id)
    .run();
  return c.json({ ok: true });
});

app.delete('/api/admin/:table/:id', async (c) => {
  const table = c.req.param('table');
  const id = Number(c.req.param('id'));
  if (!TABLES[table] || !Number.isInteger(id)) return c.json({ error: 'Қате сұраныс' }, 400);
  await c.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  return c.json({ ok: true });
});

/* ------------------------------ қателер / статика --------------------------- */

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Сервер қатесі' }, 500);
});

app.notFound((c) => {
  if (new URL(c.req.url).pathname.startsWith('/api/')) return c.json({ error: 'Табылмады' }, 404);
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
