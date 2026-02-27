import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: /api/visual-editor-proxy
 *
 * Fetches the sandbox page HTML and injects a postMessage bootstrap
 * listener before the closing </body> tag. This makes the page same-origin
 * with the parent app AND embeds the bootstrap script so the parent can
 * inject the visual editor via postMessage.
 *
 * Flow:
 * 1. Parent loads this URL in an iframe (same-origin)
 * 2. This route fetches the actual sandbox HTML
 * 3. Injects a bootstrap script that listens for "inject-script" messages
 * 4. The page renders as if it were the original sandbox, but now the
 *    parent can inject scripts via postMessage
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("Missing url parameter", { status: 400 });
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
            return new NextResponse(`Failed to fetch sandbox: ${response.status}`, {
                status: response.status,
            });
        }

        let html = await response.text();

        // Bootstrap script that listens for parent postMessage to inject scripts
        const bootstrapScript = `
<script data-devflow-bootstrap>
  // DevFlow Visual Editor Bootstrap
  window.addEventListener('message', function(e) {
    var msg = e.data;
    if (!msg || !msg.type) return;

    if (msg.type === 'inject-script' && msg.script) {
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
`;

        // Rewrite asset URLs to point back to the sandbox
        // This ensures CSS, JS, images etc. load from the original sandbox
        const sandboxOrigin = new URL(url).origin;

        // Inject the bootstrap script before </body> or at the end
        if (html.includes("</body>")) {
            html = html.replace("</body>", `${bootstrapScript}</body>`);
        } else {
            html += bootstrapScript;
        }

        // Rewrite relative src/href to absolute sandbox URLs
        html = html.replace(
            /(src|href|action)=["'](\/[^"']*?)["']/g,
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
            },
        });
    } catch (error) {
        console.error("[visual-editor-proxy] Error:", error);
        return new NextResponse(
            `Failed to proxy sandbox: ${error instanceof Error ? error.message : "Unknown error"}`,
            { status: 500 }
        );
    }
}
