import "src/core/global";

import { EditorManager } from "src/core/Editor/core/EditorManager";

import "src/core/Editor/components/SnippetConfiguration/SnippetConfiguration";

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement, "../snippets");
