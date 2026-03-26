export type TBlocConfiguration = {
    type: string;
    key: string;
    label: string;
    defaultValue?: any;
    options?: Record<string, any>;
}

export abstract class BlocConfiguration {

    static eventName = "bloc-config-change";

    private _type: string;
    private _key: string;
    private _label: string;
    private _defaultValue: any;
    private _options?: Record<string, any>;

    constructor(config: TBlocConfiguration) {
        this._type         = config.type;
        this._key          = config.key;
        this._label        = config.label;
        this._defaultValue = config.defaultValue;
        this._options      = config.options;
    }

    get label()        { return this._label; }
    get type()         { return this._type; }
    get key()          { return this._key; }
    get defaultValue() { return this._defaultValue; }
    get options()      { return this._options; }

    set value(val: any){
        const event = new CustomEvent(BlocConfiguration.eventName, {
            detail: {
                key: this.key,
                value: val
            }
        });
        document.dispatchEvent(event);
    }

    abstract get value(): any;
    abstract get htmlElement(): HTMLElement;
}