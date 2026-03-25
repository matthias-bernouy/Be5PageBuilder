export abstract class BlocConfiguration {

    private _type: string;
    private _key: string;
    private _label: string;
    private _defaultValue: any;
    private _options: Record<string, any>;

    constructor(config: BlocConfiguration) {
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

    abstract get value(): any;
    abstract get htmlElement(): HTMLElement;
}