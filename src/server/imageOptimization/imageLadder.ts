// Whitelisted set of widths/heights the public /media endpoint will resize
// to. Two tiers:
//
//  - Icon tier (16/32/64/128): standard favicon / touch-icon / avatar
//    sizes. Doubling cadence — at this scale absolute byte cost is tiny
//    and the 100px-linear rule of the content tier doesn't make sense
//    (the gap would swallow the whole tier).
//
//  - Content tier (300…4000, step 100): the main responsive-image range.
//    Linear step (not geometric): the absolute pixel overshoot between
//    a requested-but-rejected size and the next ladder rung stays
//    bounded at every scale — a 10% relative gap at 400px is ~40px,
//    but a 10% gap at 3500px is 350px and would push every responsive
//    image onto the next ladder rung. Floor of 300 reflects the
//    smallest realistic mobile viewport × DPR=2; cap of 4000 covers
//    retina/4K UI cases without enabling abusive resize requests.
export const LADDER_WIDTHS: readonly number[] = (() => {
    const arr: number[] = [16, 32, 64, 128];
    for (let w = 300; w <= 4000; w += 100) arr.push(w);
    return arr;
})();

export const LADDER_SET: ReadonlySet<number> = new Set(LADDER_WIDTHS);

export function isLadderDimension(n: number): boolean {
    return LADDER_SET.has(n);
}
