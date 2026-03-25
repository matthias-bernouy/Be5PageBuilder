import "src/core/Editor/AdminLayout/AdminLayout"

import "src/core/Editor/Component/Form/Button/Button"
import "src/core/Editor/Component/Form/Input/Input"
import "src/core/Editor/Component/Form/InputTags/InputTags"
import "src/core/Editor/Component/Form/InputFile/InputFile"

import "src/core/Editor/Component/Table/Table"

import "src/core/Editor/Component/Tag/Tag"

import "src/core/Editor/Component/Dialog/FormDialog/FormDialog"


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