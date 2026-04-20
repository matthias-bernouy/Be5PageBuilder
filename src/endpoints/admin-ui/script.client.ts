import "src/core/Admin/components/AdminLayout/AdminLayout"

import "src/core/Media/components/CardMedia/CardMedia"
import "src/core/Media/components/CropSystem/CropSystem"
import "src/core/Media/components/DetailMedia/DetailMedia"
import "src/core/Media/components/GridMedia/GridMedia"

import "w13c/core/Form/Button/Button"
import "src/core/Editor/configuration/Inputs/P9rInput"
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