import "src/control/global";

import { EditorManager } from "src/core/Editor/runtime/EditorManager";

import "src/core/Editor/components/TemplateConfiguration/TemplateConfiguration";

const workingElement = document.getElementById(p9r.id.EDITOR)!;
new EditorManager(workingElement, "../templates");