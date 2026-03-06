import type { EditorManager } from "src/system/base/EditorManager";


declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.html" {
  const content: string;
  export default content;
}

declare global {

  interface MenuItem {
    htmlTag: string;
    title: string;
    description: string;
    icon: string;
    shortcut: string;
  }

  interface Document {
      EditorManager: EditorManager,
      menuItems: MenuItem[]
  }

}

export {}