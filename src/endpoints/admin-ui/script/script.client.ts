import "src/core/Editor/AdminLayout/AdminLayout"

import "w13c/Form/Button/Button"
import "w13c/Form/Input/Input"
import "w13c/Form/InputTags/InputTags"
import "w13c/Form/InputFile/InputFile"

import "w13c/Table/Table"

import "w13c/Tag/Tag"

import "w13c/FormDialog/FormDialog"


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