import { EditorManager } from "src/core/Editor/Base/EditorManager";

import "src/core/Editor/PageConfiguration/PageConfiguration"

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);