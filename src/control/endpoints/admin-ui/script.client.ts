import "src/control/components/admin/AdminLayout/AdminLayout"

import "src/control/components/media/CardMedia/CardMedia"
import "src/control/components/media/CropSystem/CropSystem"
import "src/control/components/media/DetailMedia/DetailMedia"
import "src/control/components/media/GridMedia/GridMedia"

import "src/control/components/base/Form/Button/Button"
import "src/control/components/base/Form/P9rInput"
import "src/control/components/base/Form/InputFile/InputFile"
import "src/control/components/base/Form/SegmentedSwitch/SegmentedSwitch"

import "src/control/components/base/Table/Table"

import "src/control/components/base/Tag/Tag"

import "src/control/components/base/Dialog/FormDialog/FormDialog"


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