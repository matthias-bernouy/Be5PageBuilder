import "src/core/EditorMode/Component/ActionGroup/ActionGroup"
import "src/core/EditorMode/FixedComponent/AdminLayout/AdminLayout"

import "src/core/EditorMode/Component/Form/Button/Button"
import "src/core/EditorMode/Component/Form/Input/Input"
import "src/core/EditorMode/Component/Form/InputTags/InputTags"
import "src/core/EditorMode/Component/Form/InputFile/InputFile"

import "src/core/EditorMode/Component/Table/Table"

import "src/core/EditorMode/Component/Tag/Tag"
import "src/core/EditorMode/Component/Badge/Badge"

import "src/core/EditorMode/Component/Dialog/FormDialog/FormDialog"


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