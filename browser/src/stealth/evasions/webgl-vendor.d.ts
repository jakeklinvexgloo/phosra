/**
 * WebGL vendor/renderer evasion
 *
 * Headless Chrome may report unusual WebGL vendor/renderer strings.
 * We override `getParameter` on both WebGLRenderingContext and
 * WebGL2RenderingContext to return common Intel integrated GPU strings,
 * which blend in with the majority of consumer machines.
 */
export default function webglVendor(): void;
