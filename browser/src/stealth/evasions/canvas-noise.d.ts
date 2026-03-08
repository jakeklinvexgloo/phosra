/**
 * Canvas fingerprint noise evasion
 *
 * Canvas fingerprinting reads pixel data from a rendered canvas to derive
 * a stable device fingerprint.  By injecting tiny, imperceptible noise
 * into `toDataURL` and `toBlob` outputs, we ensure the fingerprint is
 * unique per session without visually altering content.
 */
export default function canvasNoise(): void;
