import "src/control/global";

import { EditorManager } from "src/control/editor/runtime/EditorManager";

import "src/control/editor/components/SnippetConfiguration/SnippetConfiguration";

const workingElement = document.getElementById(p9r.id.EDITOR)!;
new EditorManager(workingElement, "../snippets");
