import "src/core/Editor/components/AdminLayout/AdminLayout"

import "src/core/Domain/Media/CardMedia/CardMedia"
import "src/core/Domain/Media/CropSystem/CropSystem"
import "src/core/Domain/Media/DetailMedia/DetailMedia"
import "src/core/Domain/Media/GridMedia/GridMedia"

import "w13c/core/Form/Button/Button"
import "w13c/core/Form/Input/Input"
import "w13c/core/Form/InputTags/InputTags"
import "w13c/core/Form/InputFile/InputFile"
import "w13c/core/Form/SegmentedSwitch/SegmentedSwitch"

import "w13c/core/Table/Table"

import "w13c/core/Tag/Tag"

import "w13c/core/Dialog/FormDialog/FormDialog"


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