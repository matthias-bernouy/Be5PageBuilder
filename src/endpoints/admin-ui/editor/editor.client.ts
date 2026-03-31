import { EditorManager } from "src/core/Editor/core/EditorManager";

import "src/core/Editor/components/PageConfiguration/PageConfiguration"

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);