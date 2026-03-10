export function send_json(content: any, status: number = 200): Response {
    return new Response(JSON.stringify(content), {
        status: status,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    });
}