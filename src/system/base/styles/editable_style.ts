const css = `
    *[contenteditable="true"]:focus,
    ::slotted([contenteditable="true"]:focus),
    ::slotted([contenteditable="true"]:focus-visible){
        outline: unset;
        background-color: rgba(150, 150, 150, 0.05);
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.03);
        border-radius: 4px;
    }
        
`

export function editable_style(){
    const style = document.createElement("style");
    style.innerHTML = css;
    return style;
}