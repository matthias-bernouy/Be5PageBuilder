import { EditorManager, type PageMode } from "src/core/EditorMode/EditorManager";
import "src/core/EditorMode/Component/Form/Button/Button";
import { HorizontalMenuEditor } from "src/core/ClientComponent/HorizontalMenu/HorizontalMenuEditor";
import "src/core/ClientComponent/HorizontalMenu/HorizontalMenu"

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);

document.EditorManager.getObserver().register_editor("w13c-horizontalmenu", HorizontalMenuEditor)
