# IT Forum — Cloudflare нұсқасы

Figma және Supabase-сіз. Бәрі Cloudflare ішінде тегін жұмыс істейді:

| Бөлік | Технология |
|---|---|
| Сайт (интерфейс) | React + Vite + Tailwind → Cloudflare Workers Static Assets |
| API | Cloudflare Worker (Hono), `worker/index.ts` |
| База | **SQLite = Cloudflare D1**, схема: `schema.sql` |
| Құпия кілттер | Cloudflare **Secrets** (кодта және git-те жоқ) |
| Тегін домен | `https://it-forum.<сіздің-аккаунт>.workers.dev` |

## Орналастыру (бір реттік баптау, ~10 минут)

Қажет: Node.js 20+ және тегін Cloudflare аккаунты (https://dash.cloudflare.com/sign-up).

```bash
npm install
npx wrangler login                    # браузер ашылады, Cloudflare-ге кіресіз

# 1) SQLite (D1) базасын жасау
npx wrangler d1 create it-forum-db
#   → шыққан database_id мәнін wrangler.toml ішіне PASTE_DATABASE_ID_HERE орнына қойыңыз

# 2) Кестелерді жасау
npm run db:init:remote

# 3) Құпия кілттерді Cloudflare Secrets-ке салу (файлға жазылмайды!)
npm run gen-secret                    # ұзын кездейсоқ жол шығады — көшіріп алыңыз
npx wrangler secret put SESSION_SECRET   # сол жолды қойыңыз
npx wrangler secret put ADMIN_PASSWORD   # админ панелінің ЖАҢА күшті құпия сөзі

# 4) Жариялау
npm run deploy
```

Соңында `https://it-forum.xxxxx.workers.dev` сілтемесі шығады. Бұл — тегін домен.
Кейін өз доменіңізді қосқыңыз келсе: Cloudflare Dashboard → Workers → it-forum → Settings → Domains.

## Жергілікті тест

```bash
cp .dev.vars.example .dev.vars        # ішіндегі екі мәнді толтырыңыз
npm run db:init:local
npm run build
npm run dev:api                       # терминал 1: API + база (8787)
npm run dev                           # терминал 2: сайт (5173), /api → 8787
```

## Қауіпсіздік (не өзгерді)

- Админ құпия сөзі браузер кодында **жоқ**; тексеру серверде. Сессия — `HttpOnly + Secure + SameSite=Strict` cookie, 12 сағат.
- Басқару (қосу/өзгерту/жою) тек жарамды сессиямен. Бұрын кез келген адам Supabase API арқылы бәрін өшіре алатын.
- Логинге 10 минутта 5 әрекет лимиті; форумға: 5 пост / 10 жауап (10 мин, IP бойынша).
- Лайк: бір IP-ден бір постқа бір рет. IP хэш түрінде ғана сақталады.
- Форум авторы "Admin/Админ/Модератор" деп аты жазыла алмайды.
- PDF сілтемесі тек `http(s)://` болуы керек (`javascript:` сілтемесі арқылы шабуыл жоқ).
- SQL-да барлық мәндер параметр арқылы беріледі, кесте аттары ақ тізімнен.

## Ескі деректерді Supabase-тен көшіру (қаласаңыз)

Supabase → Table Editor → әр кесте → Export CSV. Кейін `wrangler d1 execute it-forum-db --remote --command "INSERT ..."`
немесе CSV-ді SQL INSERT-ке айналдырып, `--file=` арқылы жүктеңіз. Форум жауаптары енді `forum_replies` кестесінде.
Қаламасаңыз, сайт бос базамен басталады, мазмұнды админ панелінен қосасыз.

## Резервтік көшірме

```bash
npx wrangler d1 export it-forum-db --remote --output=backup.sql
```

## Ескерту

- Ескі `Nugadmin456` құпия сөзі және Supabase кілттері бұрын ашық кодта болған. Жаңа құпия сөз қойыңыз, ал Supabase жобасын өшіріңіз немесе кілттерін ауыстырыңыз.
- `index.html`-да `noindex` қалдырылған (Google іздеуде көрсетпейді). Көпшілікке ашық сайт керек болса, сол жолды жойыңыз.
- Тегін D1 лимиті: күніне 5 млн оқу / 100 мың жазу. Сайт деректі минутына бір рет жаңартады, мектеп үшін жеткілікті.
- PDF кесте әзірше сілтеме арқылы қосылады (Google Drive/Cloudflare R2 сілтемесі).
