/**
 * Tiny client injected into every HTML response served by the dev server.
 * Polls `/__p9r_dev/version` and reloads on change. A 10-error streak
 * backs off quietly so a temporarily-dead server does not flood logs.
 * Also watches for a `build-error` payload and shows an overlay so build
 * failures are impossible to miss.
 */
export const LIVE_RELOAD_CLIENT = `
(function(){
    if (window.__p9rDevClientInstalled) return;
    window.__p9rDevClientInstalled = true;

    var current = null;
    var failures = 0;
    var overlay = null;

    function ensureOverlay(){
        if (overlay) return overlay;
        overlay = document.createElement("div");
        overlay.id = "__p9r_dev_overlay";
        overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,0.85);color:#f87171;font:14px/1.5 ui-monospace,Menlo,monospace;padding:24px;overflow:auto;white-space:pre-wrap;display:none;";
        document.documentElement.appendChild(overlay);
        return overlay;
    }

    function showError(msg){
        var el = ensureOverlay();
        el.textContent = "[p9r dev] Build error\\n\\n" + msg;
        el.style.display = "block";
    }
    function hideError(){
        if (overlay) overlay.style.display = "none";
    }

    async function poll(){
        try {
            var res = await fetch("/__p9r_dev/version", { cache: "no-store" });
            if (!res.ok) throw new Error("status " + res.status);
            var data = await res.json();
            failures = 0;
            if (data.error) {
                showError(data.error);
                return;
            }
            if (data.version == null) return;
            if (current === null) {
                current = data.version;
                hideError();
                return;
            }
            if (data.version !== current) {
                location.reload();
                return;
            }
            hideError();
        } catch (e) {
            failures++;
            if (failures > 10) return;
        } finally {
            setTimeout(poll, 600);
        }
    }

    poll();
})();
`;
