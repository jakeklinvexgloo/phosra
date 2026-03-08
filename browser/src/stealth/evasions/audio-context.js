"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = audioContext;
/**
 * AudioContext fingerprint noise evasion
 *
 * Audio fingerprinting uses the output of `getFloatFrequencyData` (and
 * related methods) to derive a device-unique hash.  We inject tiny noise
 * into the returned float arrays to randomise the fingerprint each session.
 */
function audioContext() {
    try {
        const NOISE_AMOUNT = 0.0001; // imperceptibly small
        // ---- patch getFloatFrequencyData ----
        if (typeof AnalyserNode !== 'undefined') {
            const origGetFloat = AnalyserNode.prototype.getFloatFrequencyData;
            AnalyserNode.prototype.getFloatFrequencyData = function (array) {
                origGetFloat.call(this, array);
                for (let i = 0; i < array.length; i++) {
                    array[i] += (Math.random() * 2 - 1) * NOISE_AMOUNT;
                }
            };
        }
        // ---- patch getFloatTimeDomainData (also used in some fingerprinters) ----
        if (typeof AnalyserNode !== 'undefined') {
            const origGetTimeDomain = AnalyserNode.prototype.getFloatTimeDomainData;
            if (origGetTimeDomain) {
                AnalyserNode.prototype.getFloatTimeDomainData = function (array) {
                    origGetTimeDomain.call(this, array);
                    for (let i = 0; i < array.length; i++) {
                        array[i] += (Math.random() * 2 - 1) * NOISE_AMOUNT;
                    }
                };
            }
        }
        // ---- patch AudioBuffer.getChannelData ----
        if (typeof AudioBuffer !== 'undefined') {
            const origGetChannel = AudioBuffer.prototype.getChannelData;
            AudioBuffer.prototype.getChannelData = function (channel) {
                const data = origGetChannel.call(this, channel);
                for (let i = 0; i < data.length; i++) {
                    data[i] += (Math.random() * 2 - 1) * NOISE_AMOUNT;
                }
                return data;
            };
        }
    }
    catch (_e) {
        // Silently ignore
    }
}
