import { spawn } from "node:child_process";

/**
 * Best-effort cross-platform `open <url>`. Uses the OS default handler
 * (`xdg-open` on Linux, `open` on macOS, `start` on Windows) rather than
 * forcing Chrome, so the user's preferred browser wins. Failures are
 * swallowed — the dev CLI already printed the URL, so a failed spawn
 * just means the user opens it manually.
 */
export function openBrowser(url: string): void {
    const platform = process.platform;
    let command: string;
    let args: string[];

    if (platform === "darwin") {
        command = "open";
        args = [url];
    } else if (platform === "win32") {
        command = "cmd";
        args = ["/c", "start", "", url];
    } else {
        command = "xdg-open";
        args = [url];
    }

    try {
        const child = spawn(command, args, { stdio: "ignore", detached: true });
        child.on("error", () => {});
        child.unref();
    } catch {}
}
