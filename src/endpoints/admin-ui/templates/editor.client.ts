import "src/core/global";

import { EditorManager } from "src/core/Editor/core/EditorManager";

import "src/core/Editor/components/TemplateConfiguration/TemplateConfiguration";

const workingElement = document.getElementById(p9r.id.EDITOR)!;
new EditorManager(workingElement, "../templates");