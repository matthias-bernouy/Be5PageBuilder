import { EditorManager } from "src/core/EditorMode/EditorManager";
import "src/core/EditorMode/Component/Form/Button/Button";

import "src/core/EditorMode/Component/Configuration/Configuration"

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);