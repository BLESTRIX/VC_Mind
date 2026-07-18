# VC Brain backend test UI

This is a minimal React/Vite interface for exercising the existing backend. It uses API endpoints for application operations and diligence data. Because the backend currently lacks list and timeline endpoints, the application list and stage-event timeline use the signed-in user's Supabase session and existing RLS policies directly.

## Run

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set the public Supabase URL and anon key in `.env.local`. Never put a service-role, Groq, Tavily, worker, or other server secret in a `VITE_` variable. During development Vite proxies `/api` to `http://localhost:3001`, so leave `VITE_API_BASE_URL` empty. For deployment, serve the API on the same origin or add backend CORS/reverse-proxy configuration.

The backend worker must be running separately for queued diligence jobs to advance:

```powershell
npm.cmd run dev
npm.cmd run jobs:drain
```
