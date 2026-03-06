// Import Components
import "src/system/Component/Quote/Quote";
import "src/system/Component/EditorToolbar/EditorToolbar";
import "src/system/base/EditorManager";

import { EditorManager } from "src/system/base/EditorManager";

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);



if ( !document.menuItems ){
    document.menuItems = [];
}

document.menuItems.push({
    htmlTag: "img",
    description: "Image",
    icon: "",
    shortcut: "I",
    title: "Image"
})
