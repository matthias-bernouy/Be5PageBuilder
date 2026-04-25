import type CmsForm from "../Form";


export default function onSubmit(e: SubmitEvent, me: CmsForm){
    
    console.log(e);
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    fetch(me.target, {
        method: me.method || "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

}