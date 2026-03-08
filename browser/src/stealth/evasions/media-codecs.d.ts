/**
 * Media codecs evasion
 *
 * Headless Chrome may report incorrect or missing codec support.  We
 * override `canPlayType` and `MediaSource.isTypeSupported` to return
 * the expected answers for common codecs (H.264, VP8, VP9, AAC, Opus).
 */
export default function mediaCodecs(): void;
