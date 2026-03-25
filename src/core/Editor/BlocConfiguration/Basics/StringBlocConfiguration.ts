import { BlocConfiguration } from "../BlocConfiguration";


export class StringBlocConfiguration extends BlocConfiguration {

    private _value: string;
    private _input: HTMLInputElement;

    constructor(config: BlocConfiguration) {
        super(config);
        this._value = config.defaultValue || "";
        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.value = this._value;

        this._input.addEventListener('input', () => {
            this._value = this._input.value;
        });
    }

    get value() { return this._value; }
    get htmlElement() { return this._input; }

}