/**
 * WebGL vendor/renderer evasion
 *
 * Headless Chrome may report unusual WebGL vendor/renderer strings.
 * We override `getParameter` on both WebGLRenderingContext and
 * WebGL2RenderingContext to return common Intel integrated GPU strings,
 * which blend in with the majority of consumer machines.
 */
export default function webglVendor(): void {
  try {
    const VENDOR = 'Intel Inc.';
    const RENDERER = 'Intel Iris OpenGL Engine';

    // UNMASKED_VENDOR_WEBGL = 0x9245
    // UNMASKED_RENDERER_WEBGL = 0x9246
    const UNMASKED_VENDOR = 0x9245;
    const UNMASKED_RENDERER = 0x9246;

    function patchContext(
      proto: WebGLRenderingContext | WebGL2RenderingContext,
    ): void {
      const original = proto.getParameter;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (proto as any).getParameter = function (param: GLenum): any {
        if (param === UNMASKED_VENDOR) return VENDOR;
        if (param === UNMASKED_RENDERER) return RENDERER;
        return original.call(this, param);
      };
    }

    if (typeof WebGLRenderingContext !== 'undefined') {
      patchContext(WebGLRenderingContext.prototype);
    }
    if (typeof WebGL2RenderingContext !== 'undefined') {
      patchContext(WebGL2RenderingContext.prototype);
    }
  } catch (_e) {
    // Silently ignore
  }
}
