import "src/core/global";

import { EditorManager } from "src/core/Editor/core/EditorManager";
import { BlocLibrary } from "src/core/Editor/components/BlocLibrary/BlocLibrary";

import "src/core/Editor/components/PageConfiguration/PageConfiguration"

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);

// When the server renders a brand-new page and a layout category is
// configured, it stamps `data-layout-category="<name>"` on #editor-system.
// Pop the BlocLibrary open on the Templates tab, locked to that category,
// so the user picks a layout before starting to edit (or closes to get a
// blank canvas).
const editorSystem = document.getElementById("editor-system");
const layoutCategory = editorSystem?.dataset.layoutCategory;
if (layoutCategory) {
    const library = BlocLibrary.open({
        section: "templates",
        category: layoutCategory,
        locked: true,
    });
    library.addEventListener("insert", ((e: CustomEvent) => {
        if (e.detail.type !== "template") return;
        workingElement.innerHTML = e.detail.html;
    }) as EventListener, { once: true });
}