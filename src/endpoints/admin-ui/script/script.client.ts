import "src/core/Editor/AdminLayout/AdminLayout"

import "w13c/Base/Form/Button/Button"
import "w13c/Base/Form/Input/Input"
import "w13c/Base/Form/InputTags/InputTags"
import "w13c/Base/Form/InputFile/InputFile"

import "w13c/Base/Table/Table"

import "w13c/Base/Tag/Tag"

import "w13c/Dialog/FormDialog/FormDialog"


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