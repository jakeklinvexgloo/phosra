"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = canvasNoise;
/**
 * Canvas fingerprint noise evasion
 *
 * Canvas fingerprinting reads pixel data from a rendered canvas to derive
 * a stable device fingerprint.  By injecting tiny, imperceptible noise
 * into `toDataURL` and `toBlob` outputs, we ensure the fingerprint is
 * unique per session without visually altering content.
 */
function canvasNoise() {
    try {
        const NOISE_INTENSITY = 2; // max +/- deviation per colour channel
        const NOISE_PIXEL_COUNT = 10; // how many pixels to modify
        function addNoise(canvas) {
            try {
                const ctx = canvas.getContext('2d');
                if (!ctx)
                    return;
                const width = canvas.width;
                const height = canvas.height;
                if (width === 0 || height === 0)
                    return;
                const imageData = ctx.getImageData(0, 0, width, height);
                const data = imageData.data;
                const totalPixels = width * height;
                for (let i = 0; i < NOISE_PIXEL_COUNT && i < totalPixels; i++) {
                    // Pick a deterministic-ish but session-variable pixel index
                    const idx = (Math.floor(Math.random() * totalPixels) * 4) % data.length;
                    // Modify RGB channels by a tiny random offset; leave alpha alone
                    for (let c = 0; c < 3; c++) {
                        const offset = Math.floor(Math.random() * (NOISE_INTENSITY * 2 + 1)) -
                            NOISE_INTENSITY;
                        data[idx + c] = Math.max(0, Math.min(255, data[idx + c] + offset));
                    }
                }
                ctx.putImageData(imageData, 0, 0);
            }
            catch (_e) {
                // Canvas may be tainted (cross-origin) — ignore
            }
        }
        // ---- patch toDataURL ----
        const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (...args) {
            addNoise(this);
            return origToDataURL.apply(this, args);
        };
        // ---- patch toBlob ----
        const origToBlob = HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob = function (...args) {
            addNoise(this);
            return origToBlob.apply(this, args);
        };
    }
    catch (_e) {
        // Silently ignore
    }
}
