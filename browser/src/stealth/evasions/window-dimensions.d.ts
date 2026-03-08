/**
 * window dimensions evasion
 *
 * In headless Chrome `window.outerWidth === window.innerWidth` and
 * `window.outerHeight === window.innerHeight`, because there is no
 * browser chrome (toolbar, scrollbar, etc.).  A real browser always
 * has a difference.  We add a realistic offset to the outer dimensions.
 */
export default function windowDimensions(): void;
