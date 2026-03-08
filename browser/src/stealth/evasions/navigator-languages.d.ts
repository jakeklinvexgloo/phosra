/**
 * navigator.languages evasion
 *
 * Ensures `navigator.languages` returns a realistic array.  Headless
 * environments sometimes return an empty array or only `['en']`, which
 * is a detection signal.
 */
export default function navigatorLanguages(): void;
