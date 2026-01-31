# Exposing MCP server with ngrok

## 1. Start your app on port 3001

```bash
PORT=3001 npm run dev
```

Or:

```bash
npx next dev -p 3001
```

Confirm in the terminal that it says something like `Local: http://localhost:3001`.

## 2. Start ngrok (use `--host-header=rewrite`)

In a **separate terminal** run:

```bash
ngrok http 3001 --host-header=rewrite
```

**Important:** `--host-header=rewrite` makes ngrok send `Host: localhost:3001` when forwarding, so Next.js dev server accepts the request. Without it you often get "Invalid Host Header" and the request never reaches your app.

Use **3001** so it matches the port your Next app is using.

## 3. MCP URL to use

After ngrok starts you'll see a line like:

- `Forwarding` **https://xxxx-xx-xx-xx-xx.ngrok-free.app** `-> http://localhost:3001`

Your MCP endpoint is that **HTTPS** URL plus `/mcp`:

- **https://YOUR-SUBDOMAIN.ngrok-free.app/mcp**

No trailing slash. Use this exact URL in MCP Inspector, Cursor, or any other client.

## 4. Test step-by-step (find where it breaks)

Run these in order and note which step fails.

**Step A – App and MCP route**

```bash
curl -s http://localhost:3001/mcp/ping
```

Expected: `{"ok":true,"message":"MCP server is reachable"}`  
If you get 404 or connection refused, the app or port is wrong.

**Step B – Through ngrok**

Replace `YOUR-NGROK-URL` with your actual ngrok URL (e.g. `abc123.ngrok-free.app`):

```bash
curl -s https://YOUR-NGROK-URL/mcp/ping
```

Expected: same JSON as Step A.  
If you get "Invalid Host Header", use `ngrok http 3001 --host-header=rewrite`.  
If you get HTML ("Visit Site"), that's the ngrok free-tier interstitial; use a non-browser client or add the header your client supports to skip it.

**Step C – MCP endpoint**

```bash
curl -s -X POST https://YOUR-NGROK-URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'
```

Expected: JSON-RPC response (e.g. `result` with `serverInfo`).  
If you get HTML, the request isn't reaching your MCP handler (often due to Host header or interstitial).

## 5. If it still doesn't work

### "Invalid Host Header"

- Start ngrok with: `ngrok http 3001 --host-header=rewrite`.
- This repo's `next.config.ts` has `allowedDevOrigins` for ngrok domains, so either rewrite or that config should help.

### Port mismatch

- App must be listening on **3001**.
- ngrok must be tunnelling **3001**: `ngrok http 3001`.

### ngrok "Visit Site" / browser warning (free tier)

On the free tier, the first request from a **browser** can get an HTML "Visit Site" page instead of your API. That breaks MCP.

- **MCP Inspector in browser**: The request may hit that page, so the client sees HTML instead of MCP and fails.  
  - Try from a **non-browser** client (e.g. Cursor, Claude Desktop, `mcp-remote`) first.  
  - Or use a paid ngrok plan so you can skip the interstitial.

### Firewall / VPN

- Temporarily turn off VPN or strict firewall and test again.
- Make sure nothing is blocking outbound ngrok or inbound tunnel traffic.

### Ping endpoint

- **GET /mcp/ping** returns `{"ok":true,"message":"MCP server is reachable"}`.
- Use it to verify the app and ngrok tunnel (see step-by-step tests above).

### CORS (browser clients only)

The app already sends `Access-Control-Allow-Origin: *`. If you use a custom domain or restrict origins later, ensure your ngrok URL's origin is allowed.

## 6. Checklist

- [ ] App running: `http://localhost:3001` works in the browser (e.g. open `http://localhost:3001`).
- [ ] Ping works: `curl -s http://localhost:3001/mcp/ping` returns `{"ok":true,...}`.
- [ ] ngrok running: `ngrok http 3001 --host-header=rewrite` in a second terminal.
- [ ] Ping through ngrok works: `curl -s https://YOUR-NGROK-URL/mcp/ping` returns the same JSON.
- [ ] Using the **HTTPS** ngrok URL + `/mcp` in the client (e.g. `https://xxxx.ngrok-free.app/mcp`).
- [ ] If using MCP Inspector in a browser and it fails, try a non-browser client first to rule out the ngrok interstitial.
