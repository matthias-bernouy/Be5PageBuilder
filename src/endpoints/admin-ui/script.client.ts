import "src/control/components/admin/AdminLayout/AdminLayout"

import "src/control/components/media/CardMedia/CardMedia"
import "src/control/components/media/CropSystem/CropSystem"
import "src/control/components/media/DetailMedia/DetailMedia"
import "src/control/components/media/GridMedia/GridMedia"

import "src/ui/Form/Button/Button"
import "src/ui/Form/P9rInput"
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