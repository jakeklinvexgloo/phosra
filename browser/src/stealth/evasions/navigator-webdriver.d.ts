/**
 * navigator.webdriver evasion
 *
 * Chromium-based automation tools set `navigator.webdriver` to true.
 * This evasion removes/overrides that property so fingerprinting scripts
 * cannot trivially detect automation.
 */
export default function navigatorWebdriver(): void;
