// Import Components
import "src/system/Component/Quote/Quote";
import "src/system/Component/EditorToolbar/EditorToolbar";
import "src/system/base/EditorManager";

import { EditorManager, type PageMode } from "src/system/base/EditorManager";

const btnSwitchMode = document.getElementById("switch-button")!;
const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);

if ( !document.menuItems ){
    document.menuItems = [];
}

document.addEventListener("switch-mode", (e: any) => {
    const mode: PageMode = e.detail;
    if ( mode === "editor-mode"){
        btnSwitchMode.innerText = "Vue client";
    } else {
        btnSwitchMode.innerText = "Vue editeur";
    }
})

document.menuItems.push({
    htmlTag: "h1",
    description: "Titre 1",
    icon: "",
    shortcut: "H1",
    title: "Titre 1"
})
