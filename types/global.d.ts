import type { EditorManager } from "src/core/Editor/core/EditorManager";
import type { MediaCenter } from "src/core/Editor/components/MediaCenter/MediaCenter";
import type { Editor } from "src/core/Editor/core/Editor";

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.html" {
  const content: string;
  export default content;
}

declare global {

  interface Document {
      EditorManager: EditorManager,
      compIdentifierToEditor: Map<string, Editor>
  }

}

export {}