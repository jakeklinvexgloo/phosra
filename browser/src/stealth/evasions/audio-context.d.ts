/**
 * AudioContext fingerprint noise evasion
 *
 * Audio fingerprinting uses the output of `getFloatFrequencyData` (and
 * related methods) to derive a device-unique hash.  We inject tiny noise
 * into the returned float arrays to randomise the fingerprint each session.
 */
export default function audioContext(): void;
