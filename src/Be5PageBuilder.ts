import { Be5System, type RunnerConstructor } from "be5-system";
import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { Component } from "./system/base/Component";
import type { Editor } from "./system/base/Editor";

type BlocDefinition = {
    metadata: MenuItem;
    component: Component;
    editor: Editor;
}

export class Be5PageBuilder extends Be5System{

    private blocs: BlocDefinition[] = [];

    constructor(runner: RunnerConstructor){
        super(runner);
        registerEndpoints(this);
    }

    registerBloc(metadata: MenuItem, component: Component, editor: Editor){
        this.blocs.push({
            metadata,
            component,
            editor
        })
    }

}