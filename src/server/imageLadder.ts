// Whitelisted set of widths/heights the public /media endpoint will resize
// to. Linear step (not geometric): the absolute pixel overshoot between a
// requested-but-rejected size and the next ladder rung is what determines
// wasted bandwidth. With a 100px step the overshoot is bounded at every
// scale — a 10% relative gap at 400px is ~40px, but a 10% gap at 3500px is
// 350px and would push every responsive image onto the next ladder rung.
//
// Floor of 300 reflects the smallest realistic mobile viewport × DPR=2; we
// never need to serve images smaller than that. Cap of 4000 covers
// retina/4K UI cases without enabling abusive resize requests.
export const LADDER_WIDTHS: readonly number[] = (() => {
    const arr: number[] = [];
    for (let w = 300; w <= 4000; w += 100) arr.push(w);
    return arr;
})();

export const LADDER_SET: ReadonlySet<number> = new Set(LADDER_WIDTHS);

export function isLadderDimension(n: number): boolean {
    return LADDER_SET.has(n);
}
