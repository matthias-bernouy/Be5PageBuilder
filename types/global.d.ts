import type { EditorManager } from "src/system/base/EditorManager";
import type { MediaCenter } from "src/system/base/snippets/MediaCenter/MediaCenter";

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
      EditorManager: EditorManager
  }

}

export {}