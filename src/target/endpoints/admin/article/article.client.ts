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

const workingElement = document.getElementById("editor")!;
new EditorManager(workingElement);
