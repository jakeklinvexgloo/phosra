/**
 * navigator.plugins & navigator.mimeTypes evasion
 *
 * Headless Chrome reports an empty `navigator.plugins` array, whereas a
 * normal desktop Chrome ships with at least 3 built-in plugins.  We fake
 * the three standard plugins and the application/pdf MIME type.
 */
export default function pluginsMimetypes(): void;
