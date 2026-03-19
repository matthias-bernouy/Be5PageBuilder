import "src/core/EditorMode/Component/ActionGroup/ActionGroup"
import "src/core/EditorMode/FixedComponent/AdminLayout/AdminLayout"

document.addEventListener('click', (e: any) => {
    const btn = e.target.closest('[data-modal]');
    if (btn) {
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId) as any;
        if (modal) {
            modal.showModal();
        }
    }
});