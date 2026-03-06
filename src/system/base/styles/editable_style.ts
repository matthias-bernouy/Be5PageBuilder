const css = `
    *[contenteditable="true"]:focus,
    ::slotted([contenteditable="true"]:focus),
    ::slotted([contenteditable="true"]:focus-visible){
        background-color: #f9f9f9;
        outline: unset;
    }
        
`


export function editable_style(){
    const style = document.createElement("style");
    style.innerHTML = css;
    return style;
}