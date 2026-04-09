/**
 * Pure positioning math for <p9r-bloc-action-group>.
 *
 * The group floats above a target bloc and hangs two "+" buttons on its
 * edges. Where it lands depends on the cursor position, the target's rect,
 * and whether the bloc is tagged for inline adding. These helpers return
 * coordinates — the component applies them to `style.transform`/`style.top`.
 */

export type VAnchor = "top" | "bottom";

export type PositionInput = {
    rect: DOMRect;
    barWidth: number;
    barHeight: number;
    mouseX: number;
    mouseY: number;
};

/**
 * Places the floating group above or below the bloc depending on the
 * cursor's Y position, and clamps its X inside the bloc's horizontal span.
 */
export function computeGroupPosition(input: PositionInput): { x: number; y: number; vAnchor: VAnchor } {
    const { rect, barWidth, barHeight, mouseX, mouseY } = input;
    const centerY = rect.top + rect.height / 2;
    const vAnchor: VAnchor = mouseY < centerY ? "top" : "bottom";

    const halfWidth = barWidth / 2;
    let x = mouseX + window.scrollX - halfWidth;
    const minX = rect.left + window.scrollX;
    const maxX = rect.right + window.scrollX - barWidth;
    x = Math.max(minX, Math.min(maxX, x));

    const y = vAnchor === "top"
        ? rect.top + window.scrollY - barHeight
        : rect.bottom + window.scrollY;

    return { x, y, vAnchor };
}

/**
 * Positions the two insert-before / insert-after "+" buttons around `rect`.
 * `inline` flips between a horizontal layout (buttons on the left/right of
 * the bloc, for text-like targets) and the default vertical layout (above
 * and below).
 */
export function positionInsertButtons(
    btnBefore: HTMLButtonElement,
    btnAfter: HTMLButtonElement,
    rect: DOMRect,
    inline: boolean,
    show: { before: boolean; after: boolean },
) {
    btnBefore.classList.toggle("p9r-insert-btn--inline", inline);
    btnAfter.classList.toggle("p9r-insert-btn--inline", inline);

    if (!show.before && !show.after) return;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (inline) {
        const centerY = rect.top + scrollY + rect.height / 2 - 12;
        if (show.before) {
            btnBefore.style.left = `${rect.left + scrollX - 12}px`;
            btnBefore.style.top = `${centerY}px`;
            btnBefore.style.display = "flex";
        }
        if (show.after) {
            btnAfter.style.left = `${rect.right + scrollX - 12}px`;
            btnAfter.style.top = `${centerY}px`;
            btnAfter.style.display = "flex";
        }
    } else {
        const centerX = rect.left + scrollX + rect.width / 2 - 12;
        if (show.before) {
            btnBefore.style.left = `${centerX}px`;
            btnBefore.style.top = `${rect.top + scrollY - 12}px`;
            btnBefore.style.display = "flex";
        }
        if (show.after) {
            btnAfter.style.left = `${centerX}px`;
            btnAfter.style.top = `${rect.bottom + scrollY - 12}px`;
            btnAfter.style.display = "flex";
        }
    }
}
