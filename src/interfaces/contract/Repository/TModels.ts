export type TBloc = {
    id: string;
    name: string; 
    viewJS: string;
    editorJS: string;
}

export type TPage = {
  id?: string;
  /**
   * Optional discriminator within a path. Pages are uniquely identified by
   * (path, identifier). When empty, the page is the default for its path
   * and is served without any query parameter: e.g. `/article`. When set,
   * the page is served as `/article?identifier=foo`.
   */
  identifier: string;
  path: string;
  content: string;
  title: string;
  description: string;
  visible: boolean;
  tags: string[];
}



export type ColorShades = {
    contrasted: string;
    base: string;
    muted: string;
}

export type TTheme = {

    colors: {
        primary: ColorShades;
        secondary: ColorShades;

        danger: ColorShades;
        success: ColorShades;
        warning: ColorShades;
        info: ColorShades;

        text: {
            title: string;
            body: string;
            muted: string;
        }

        background: {
            base: string;
            surface: string;
            overlay: string;
        }

        border: ColorShades
    },

    sizes: {
        border: {
            radius: {
                sm: string,
                m: string
            },
        }
    }
    
}

export type TTemplate = {
    id?: string;
    name: string;
    description: string;
    content: string;
    category: string;
    createdAt: Date;
}

export type TSnippet = {
    id?: string;
    identifier: string;
    name: string;
    description: string;
    content: string;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TSystem = {

    initializationStep: number;

    site: {
        name: string;
        theme: string;
        favicon: string;
        visible: boolean;
        homePage: string;
        page404: string;
        page500: string;
    },

    seo: {
        titleTemplate: string;
        defaultDescription: string;
        defaultOgImage: string;
    },

    editor: {
        blocAtPageCreation: string;
    }

}