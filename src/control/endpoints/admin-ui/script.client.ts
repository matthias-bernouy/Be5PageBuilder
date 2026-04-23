import "src/control/components/admin/AdminLayout/AdminLayout"

import "src/control/components/media/CardMedia/CardMedia"
import "src/control/components/media/CropSystem/CropSystem"
import "src/control/components/media/DetailMedia/DetailMedia"
import "src/control/components/media/GridMedia/GridMedia"

import "@bernouy/socle"
import "@bernouy/socle"
import "@bernouy/socle"
import "@bernouy/socle"

import "@bernouy/socle"

import "@bernouy/socle"

import "@bernouy/socle"


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