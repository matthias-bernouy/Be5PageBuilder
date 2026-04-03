import { MenuItem } from "./sub/MenuItem";

export function register(id_parent_component: string){

    customElements.define(id_parent_component + "-item", MenuItem)

}