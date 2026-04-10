
export function send_html(html: string, status: number = 200) {
    return new Response(html, {
        headers: { "Content-Type": "text/html" },
        status,
    });
}