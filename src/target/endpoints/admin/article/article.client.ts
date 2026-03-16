import { EditorManager, type PageMode } from "src/core/EditorMode/EditorManager";
import "src/core/EditorMode/Component/Form/Button/Button";

document.addEventListener('click', (e: any) => {
    const btn = e.target.closest('[data-modal]');
    if (btn) {
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId) as any;
        if (modal){
            modal.showModal();
        }
    }
});

const btnSwitchMode = document.getElementById("switch-button")!;
const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);

document.addEventListener("switch-mode", (e: any) => {
    const mode: PageMode = e.detail;
    if ( mode === "editor-mode"){
        btnSwitchMode.innerText = "Vue client";
    } else {
        btnSwitchMode.innerText = "Vue editeur";
    }
})

