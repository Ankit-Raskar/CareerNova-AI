import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

// Dev-only middleware that runs `api/**/*.ts` files like Vercel Edge Functions.
// In production (Vercel), the `api/` folder is served natively as serverless
// functions — this plugin only matters for `vite dev` / preview.
function vercelApiDevPlugin(): Plugin {
  return {
    name: "vercel-api-dev",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url || "";
        if (!url.startsWith("/api/")) return next();

        // Map /api/foo/bar?x=1 -> api/foo/bar.ts
        const pathname = url.split("?")[0]!.replace(/\/+$/, "");
        const candidate = resolve(process.cwd(), "." + pathname + ".ts");
        if (!existsSync(candidate)) return next();

        try {
          const mod = await server.ssrLoadModule(candidate);
          const handler = (mod as { default?: (req: Request) => Promise<Response> | Response })
            .default;
          if (typeof handler !== "function") return next();

          // Build a Web Request from the Node request
          const proto = (req.headers["x-forwarded-proto"] as string) || "http";
          const host = (req.headers.host as string) || "localhost";
          const fullUrl = `${proto}://${host}${url}`;

          const method = (req.method || "GET").toUpperCase();
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv));
            else if (v != null) headers.set(k, String(v));
          }

          let body: BodyInit | undefined;
          if (method !== "GET" && method !== "HEAD") {
            const chunks: Buffer[] = [];
            await new Promise<void>((resolveStream, reject) => {
              req.on("data", (c) => chunks.push(c as Buffer));
              req.on("end", () => resolveStream());
              req.on("error", reject);
            });
            if (chunks.length) body = Buffer.concat(chunks);
          }

          const webReq = new Request(fullUrl, { method, headers, body });
          const webRes = await handler(webReq);

          res.statusCode = webRes.status;
          webRes.headers.forEach((v, k) => res.setHeader(k, v));

          if (!webRes.body) {
            res.end();
            return;
          }

          // Stream the response (supports SSE / streaming endpoints like /api/public/mentor)
          const reader = webRes.body.getReader();
          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(Buffer.from(value));
              }
            } finally {
              res.end();
            }
          };
          await pump();
        } catch (err) {
          console.error("[vercel-api-dev]", url, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
          }
          res.end(JSON.stringify({ error: "Dev API handler crashed" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load .env files into process.env so server-side handlers (which use
  // `process.env.X`) can read LOVABLE_API_KEY, ADZUNA_APP_ID, etc. in dev.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }

  return {
    plugins: [
      TanStackRouterVite({
        target: "react",
        autoCodeSplitting: true,
        routesDirectory: "src/routes",
        generatedRouteTree: "src/routeTree.gen.ts",
      }),
      react(),
      tailwindcss(),
      tsconfigPaths(),
      vercelApiDevPlugin(),
    ],
    server: {
      host: "::",
      port: 8080,
    },
  };
});
