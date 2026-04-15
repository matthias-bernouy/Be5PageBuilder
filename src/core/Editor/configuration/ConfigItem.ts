export abstract class ConfigItem extends HTMLElement{

    abstract onEditorMode(): void;
    abstract init(addedNode?: HTMLElement): void;

}