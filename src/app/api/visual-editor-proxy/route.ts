import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getVisualEditorScript } from "@/lib/visual-editor-inject";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// In-memory rate limiting map: userId -> [timestamp, timestamp, ...]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 req/min

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    validTimestamps.push(now);
    rateLimitMap.set(key, validTimestamps);
    return true;
}

export function isValidSandboxUrl(rawUrl: string): boolean {
    try {
        const parsed = new URL(rawUrl);

        // Protocol check
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return false;
        }

        const hostname = parsed.hostname.toLowerCase();

        // Must be an official E2B sandbox domain (.e2b.app or .e2b.dev) or localhost for local dev
        const isE2B =
            hostname.endsWith(".e2b.app") ||
            hostname.endsWith(".e2b.dev") ||
            hostname === "e2b.app" ||
            hostname === "e2b.dev";

        const isLocalDev =
            process.env.NODE_ENV !== "production" &&
            (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local"));

        if (!isE2B && !isLocalDev) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * API Route: /api/visual-editor-proxy
 *
 * Fetches the sandbox page HTML and injects:
 *  1. <base href="..."> to ensure relative assets and dynamic chunks resolve to the sandbox
 *  2. Visual editor script for instant point-and-click editing
 *  3. PostMessage bootstrap listener for parent communication
 */
export async function GET(request: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        logger.warn("[visual-editor-proxy] Unauthorized request - no active Clerk session");
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rate limit per user
    if (!checkRateLimit(userId)) {
        logger.warn("[visual-editor-proxy] Rate limit exceeded", { userId });
        return new NextResponse("Rate limit exceeded. Try again in a minute.", { status: 429 });
    }

    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    if (!isValidSandboxUrl(url)) {
        logger.warn("[visual-editor-proxy] Rejected invalid or unauthorized sandbox URL", { url });
        return new NextResponse(
            `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;color:#555;">
            <div style="text-align:center;padding:2rem;max-width:480px;">
              <h3 style="margin-bottom:0.5rem;color:#111;">Invalid Sandbox URL</h3>
              <p style="font-size:14px;line-height:1.5;">The provided preview URL is not authorized for proxying.</p>
            </div>
            </body></html>`,
            {
                status: 403,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            }
        );
    }

    try {
        // Fetch the sandbox page
        const response = await fetch(url, {
            headers: {
                "User-Agent": request.headers.get("user-agent") || "",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        });

        if (!response.ok) {
            logger.warn("[visual-editor-proxy] Sandbox returned non-200", { url, status: response.status });
            return new NextResponse(
                `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;color:#555;">
                <div style="text-align:center;padding:2rem;max-width:480px;">
                  <h3 style="margin-bottom:0.5rem;color:#111;">Preview Sandbox Starting Up (${response.status})</h3>
                  <p style="font-size:14px;line-height:1.5;">The application sandbox is starting up or compiling. Please wait a few seconds and try again.</p>
                </div>
                </body></html>`,
                {
                    status: response.status,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                }
            );
        }

        let html = await response.text();
        const sandboxOrigin = new URL(url).origin;

        // Strip any meta CSP that might block iframe embedding or script injection
        html = html.replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, "");

        // Inject <base href="..."> so that all relative requests (chunks, fonts, fetch, images) resolve to the sandbox
        if (!html.includes("<base ")) {
            if (html.includes("<head>")) {
                html = html.replace("<head>", `<head><base href="${sandboxOrigin}/">`);
            } else if (html.includes("<html")) {
                html = html.replace(/<html[^>]*>/i, `$&<head><base href="${sandboxOrigin}/"></head>`);
            } else {
                html = `<base href="${sandboxOrigin}/">` + html;
            }
        }

        // Visual Editor scripts: bootstrap listener + instant editor activation
        const editorScripts = `
<script data-devflow-bootstrap>
  // DevFlow Visual Editor Bootstrap
  window.addEventListener('message', function(e) {
    var msg = e.data;
    if (!msg || !msg.type) return;

    if (msg.type === 'inject-script' && msg.script) {
      if (window.__devflow_editor_active) return;
      try {
        var scriptEl = document.createElement('script');
        scriptEl.setAttribute('data-devflow-editor', 'true');
        scriptEl.textContent = msg.script;
        document.body.appendChild(scriptEl);
      } catch (err) {
        console.error('[DevFlow] Failed to inject editor script:', err);
      }
    }
  });
</script>
<script data-devflow-editor="true">
${getVisualEditorScript()}
</script>
`;

        // Inject the scripts before </body> or at the end
        if (html.includes("</body>")) {
            html = html.replace("</body>", `${editorScripts}</body>`);
        } else {
            html += editorScripts;
        }

        // Rewrite relative src/href/action to absolute sandbox URLs, avoiding protocol-relative URLs (//)
        html = html.replace(
            /(src|href|action)=["'](\/(?!\/)[^"']*?)["']/g,
            (match, attr, path) => {
                return `${attr}="${sandboxOrigin}${path}"`;
            }
        );

        // Also rewrite Next.js /_next/ asset paths in inline scripts
        html = html.replace(
            /"\/_next\//g,
            `"${sandboxOrigin}/_next/`
        );

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        logger.error("[visual-editor-proxy] Failed to proxy sandbox", error, { url: url || undefined });
        return new NextResponse(
            `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fafafa;color:#555;">
            <div style="text-align:center;padding:2rem;max-width:480px;">
              <h3 style="margin-bottom:0.5rem;color:#111;">Unable to Connect to Preview Sandbox</h3>
              <p style="font-size:14px;line-height:1.5;">${error instanceof Error ? error.message : "Unknown error connecting to sandbox"}</p>
            </div>
            </body></html>`,
            {
                status: 502,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            }
        );
    }
}

