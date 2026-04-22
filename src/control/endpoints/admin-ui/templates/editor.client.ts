import "src/control/global";

import { EditorManager } from "src/control/editor/runtime/EditorManager";

import "src/control/editor/components/TemplateConfiguration/TemplateConfiguration";

const workingElement = document.getElementById(p9r.id.EDITOR)!;
new EditorManager(workingElement, "../templates");