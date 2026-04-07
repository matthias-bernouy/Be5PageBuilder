export type TBloc = {
    id: string;
    name: string; 
    viewJS: string;
    editorJS: string;
}

export type TPage = {
  id?: string;
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

export type TSystem = {

    initializationStep: number;

    site: {
        theme: Uint8Array;
        favicon: Uint8Array;
        visible: boolean;
    },

    editor: {
        blocAtPageCreation: string; // bloc identifier
    }

}