import type EditorRoot from "src/control/components/editor/EditorSystem/EditorRoot/EditorRoot";
import { NearestElementRequire } from "src/control/errors/NearestElementRequire";


export default function getClosestEditorSystem(ele: HTMLElement){
    const editorManager = ele.closest("cms-editor-system") as EditorRoot;
    if ( !editorManager ) throw new NearestElementRequire(ele, "cms-editor-system");
    return editorManager
}