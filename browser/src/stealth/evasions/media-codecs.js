"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mediaCodecs;
/**
 * Media codecs evasion
 *
 * Headless Chrome may report incorrect or missing codec support.  We
 * override `canPlayType` and `MediaSource.isTypeSupported` to return
 * the expected answers for common codecs (H.264, VP8, VP9, AAC, Opus).
 */
function mediaCodecs() {
    try {
        // Map of MIME types to their expected support level
        const CODEC_SUPPORT = {
            // Video
            'video/mp4': 'maybe',
            'video/mp4; codecs="avc1.42E01E"': 'probably',
            'video/mp4; codecs="avc1.42E01E, mp4a.40.2"': 'probably',
            'video/mp4; codecs="avc1.4D401E"': 'probably',
            'video/mp4; codecs="avc1.64001E"': 'probably',
            'video/mp4; codecs="avc1.640028"': 'probably',
            'video/mp4; codecs="mp4a.40.2"': 'probably',
            'video/webm': 'maybe',
            'video/webm; codecs="vp8"': 'probably',
            'video/webm; codecs="vp8, vorbis"': 'probably',
            'video/webm; codecs="vp9"': 'probably',
            'video/webm; codecs="vp9, opus"': 'probably',
            'video/ogg': 'maybe',
            'video/ogg; codecs="theora"': 'probably',
            'video/ogg; codecs="theora, vorbis"': 'probably',
            // Audio
            'audio/mp4': 'maybe',
            'audio/mp4; codecs="mp4a.40.2"': 'probably',
            'audio/mpeg': 'probably',
            'audio/webm': 'maybe',
            'audio/webm; codecs="opus"': 'probably',
            'audio/webm; codecs="vorbis"': 'probably',
            'audio/ogg': 'maybe',
            'audio/ogg; codecs="vorbis"': 'probably',
            'audio/ogg; codecs="opus"': 'probably',
            'audio/wav': 'maybe',
            'audio/wave': 'maybe',
            'audio/x-wav': 'maybe',
            'audio/aac': 'maybe',
        };
        // Types supported by MediaSource (MSE)
        const MSE_SUPPORTED = new Set([
            'video/mp4; codecs="avc1.42E01E"',
            'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
            'video/mp4; codecs="avc1.4D401E"',
            'video/mp4; codecs="avc1.64001E"',
            'video/mp4; codecs="avc1.640028"',
            'video/mp4; codecs="mp4a.40.2"',
            'video/webm; codecs="vp8"',
            'video/webm; codecs="vp8, vorbis"',
            'video/webm; codecs="vp9"',
            'video/webm; codecs="vp9, opus"',
            'audio/mp4; codecs="mp4a.40.2"',
            'audio/webm; codecs="opus"',
            'audio/webm; codecs="vorbis"',
        ]);
        // ---- patch HTMLMediaElement.prototype.canPlayType ----
        const origCanPlayType = HTMLMediaElement.prototype.canPlayType;
        HTMLMediaElement.prototype.canPlayType = function (type) {
            const normalised = type.replace(/\s+/g, ' ').trim();
            if (normalised in CODEC_SUPPORT) {
                return CODEC_SUPPORT[normalised];
            }
            return origCanPlayType.call(this, type);
        };
        // ---- patch MediaSource.isTypeSupported ----
        if (typeof MediaSource !== 'undefined') {
            const origIsTypeSupported = MediaSource.isTypeSupported;
            MediaSource.isTypeSupported = function (type) {
                const normalised = type.replace(/\s+/g, ' ').trim();
                if (MSE_SUPPORTED.has(normalised)) {
                    return true;
                }
                return origIsTypeSupported.call(MediaSource, type);
            };
        }
    }
    catch (_e) {
        // Silently ignore
    }
}
