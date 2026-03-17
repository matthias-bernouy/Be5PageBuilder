export default function not_found(content: string){
    return new Response(content, {
        status: 404
    })
}