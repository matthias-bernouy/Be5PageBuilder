import "src/core/Admin/components/AdminLayout/AdminLayout"

import "src/core/Media/components/CardMedia/CardMedia"
import "src/core/Media/components/CropSystem/CropSystem"
import "src/core/Media/components/DetailMedia/DetailMedia"
import "src/core/Media/components/GridMedia/GridMedia"

import "src/ui/Form/Button/Button"
import "src/core/Editor/configuration/Inputs/P9rInput"
import "src/ui/Form/InputFile/InputFile"
import "src/ui/Form/SegmentedSwitch/SegmentedSwitch"

import "src/ui/Table/Table"

import "src/ui/Tag/Tag"

import "src/ui/Dialog/FormDialog/FormDialog"


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