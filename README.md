# Stock Price Dashboard (React + Vite + Tailwind)

A simple stock dashboard that shows a table of quotes and an optional price chart. Uses the free Financial Modeling Prep API (demo key by default).

## 1) Run locally

```bash
npm install
cp .env.example .env      # optional; defaults to demo key
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## 2) How to use

- Edit tickers at the top (comma separated), then click **Update**.
- Use **Search** to filter.
- Click table headers to sort.
- Select a symbol to see its chart.

## 3) Deploy

### Vercel

1. Push this folder to a GitHub repo.
2. On Vercel, **New Project** → select the repo.
3. Framework: **Other**; Build: `npm run build`; Output: `dist`.
4. Add Environment Variable (optional): `VITE_FMP_API_KEY` → your key.
5. Deploy.

### Netlify

- Connect your repo → build command `npm run build` → publish directory `dist`.
- Add `VITE_FMP_API_KEY` in Site settings → Environment if desired.

### GitHub Pages

1. Add the dev dependency: `npm i -D gh-pages` (already added).
2. Build & publish:
   ```bash
   npm run deploy:gh
   ```
3. In repo settings, enable GitHub Pages to serve from `gh-pages` branch if needed.

> If your Pages repo is served from a subpath, set `base` in `vite.config.ts` accordingly:
>
> ```ts
> export default defineConfig({ plugins:[react()], base: '/YOUR-REPO-NAME/' })
> ```

## 4) Notes

- The demo key is rate-limited. For reliability, create a free account and put your key in `.env` as `VITE_FMP_API_KEY=your_key`.
- Keys in client-side apps are visible to users. For hiding keys, use a serverless function/proxy.
- This project is for learning; not investment advice.