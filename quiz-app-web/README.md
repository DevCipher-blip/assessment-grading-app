# quiz-app-web

React client for the written-response exercise, built with Vite and tested with Vitest.

Node.js 22.12 or newer is required (see `.nvmrc`).

```sh
npm ci
cp .env.example .env   # VITE_API_BASEURL points at the Django API
npm run dev            # http://localhost:5173
npm test
npm run lint
npm run build          # writes dist/
```

`VITE_API_BASEURL` is read at build time, so rebuild after changing it.
