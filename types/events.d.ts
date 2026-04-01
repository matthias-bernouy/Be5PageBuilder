export interface SwitchModeEvent extends CustomEvent {
    readonly detail: {
        mode: "editor" | "view"
    };
}

export interface BlocSelected extends CustomEvent {
    readonly detail: {
        tag: string
    };
}


export interface ImageSelected extends CustomEvent {
    readonly detail: {
        src: string,
        alt: string
    };
}

declare global {

    interface HTMLElementEventMap {
        "p9r-bloc-selected": BlocSelected,
        "p9r-image-selected": ImageSelected
	}


	interface DocumentEventMap {
        "p9r-switch-mode": SwitchModeEvent;
    }

}

export {}