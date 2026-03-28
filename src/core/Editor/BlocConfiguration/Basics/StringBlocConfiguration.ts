import type { Input } from "w13c/Base/Form/Input/Input";
import { BlocConfiguration, type TBlocConfiguration } from "../BlocConfiguration";


export class StringBlocConfiguration extends BlocConfiguration {

    private _value: string;
    private _input: Input;

    constructor(config: Omit<TBlocConfiguration, "type">) {
        console.log("Creating StringBlocConfiguration with config", config)
        super({ ...config, type: "string" });
        this._value = config.defaultValue || "";
        this._input = document.createElement('w13c-input') as Input;
        
        const label = document.createElement('span');
        label.textContent = this.label;
        label.setAttribute('slot', 'label');
        this._input.append(label);

        this._input.setAttribute('value', this._value);
        this._input.setAttribute('placeholder', this.label);

        this._input.addEventListener('input', () => {
            this._value = this._input.value;
        });
    }

    get value() { return this._value; }
    get htmlElement() { return this._input; }

}