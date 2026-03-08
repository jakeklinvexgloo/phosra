/**
 * navigator.plugins & navigator.mimeTypes evasion
 *
 * Headless Chrome reports an empty `navigator.plugins` array, whereas a
 * normal desktop Chrome ships with at least 3 built-in plugins.  We fake
 * the three standard plugins and the application/pdf MIME type.
 */
export default function pluginsMimetypes(): void {
  try {
    // ---- helpers ----
    function makeMimeType(
      type: string,
      suffixes: string,
      description: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plugin: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any {
      const mt = Object.create(MimeType.prototype);
      Object.defineProperties(mt, {
        type: { value: type, enumerable: true },
        suffixes: { value: suffixes, enumerable: true },
        description: { value: description, enumerable: true },
        enabledPlugin: { value: plugin, enumerable: true },
      });
      return mt;
    }

    function makePlugin(
      name: string,
      description: string,
      filename: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mimeTypes: any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any {
      const p = Object.create(Plugin.prototype);
      Object.defineProperties(p, {
        name: { value: name, enumerable: true },
        description: { value: description, enumerable: true },
        filename: { value: filename, enumerable: true },
        length: { value: mimeTypes.length, enumerable: true },
      });
      // Index access
      mimeTypes.forEach((mt, i) => {
        Object.defineProperty(p, i, { value: mt, enumerable: false });
        Object.defineProperty(p, mt.type, { value: mt, enumerable: false });
      });
      p.item = (index: number) => mimeTypes[index] || null;
      p.namedItem = (name: string) =>
        mimeTypes.find(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mt: any) => mt.type === name,
        ) || null;
      return p;
    }

    // ---- build fake data ----
    const pdfPlugin = makePlugin(
      'Chrome PDF Plugin',
      'Portable Document Format',
      'internal-pdf-viewer',
      [],
    );
    const pdfMime = makeMimeType(
      'application/pdf',
      'pdf',
      'Portable Document Format',
      pdfPlugin,
    );
    const pdfXMime = makeMimeType(
      'application/x-google-chrome-pdf',
      'pdf',
      'Portable Document Format',
      pdfPlugin,
    );
    // Back-reference
    Object.defineProperties(pdfPlugin, {
      0: { value: pdfMime, enumerable: false },
      1: { value: pdfXMime, enumerable: false },
      length: { value: 2, enumerable: true },
    });

    const pdfViewerPlugin = makePlugin(
      'Chrome PDF Viewer',
      'Portable Document Format',
      'internal-pdf-viewer',
      [pdfMime],
    );

    const naclPlugin = makePlugin(
      'Native Client',
      '',
      'internal-nacl-plugin',
      [],
    );

    const allPlugins = [pdfPlugin, pdfViewerPlugin, naclPlugin];
    const allMimeTypes = [pdfMime, pdfXMime];

    // ---- override navigator.plugins ----
    const fakePluginArray = Object.create(PluginArray.prototype);
    Object.defineProperty(fakePluginArray, 'length', {
      value: allPlugins.length,
      enumerable: true,
    });
    allPlugins.forEach((p, i) => {
      Object.defineProperty(fakePluginArray, i, {
        value: p,
        enumerable: false,
      });
      Object.defineProperty(fakePluginArray, p.name, {
        value: p,
        enumerable: false,
      });
    });
    fakePluginArray.item = (index: number) => allPlugins[index] || null;
    fakePluginArray.namedItem = (name: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allPlugins.find((p: any) => p.name === name) || null;
    fakePluginArray.refresh = () => {};

    Object.defineProperty(Object.getPrototypeOf(navigator), 'plugins', {
      get: () => fakePluginArray,
      configurable: true,
      enumerable: true,
    });

    // ---- override navigator.mimeTypes ----
    const fakeMimeTypeArray = Object.create(MimeTypeArray.prototype);
    Object.defineProperty(fakeMimeTypeArray, 'length', {
      value: allMimeTypes.length,
      enumerable: true,
    });
    allMimeTypes.forEach((mt, i) => {
      Object.defineProperty(fakeMimeTypeArray, i, {
        value: mt,
        enumerable: false,
      });
      Object.defineProperty(fakeMimeTypeArray, mt.type, {
        value: mt,
        enumerable: false,
      });
    });
    fakeMimeTypeArray.item = (index: number) => allMimeTypes[index] || null;
    fakeMimeTypeArray.namedItem = (name: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allMimeTypes.find((mt: any) => mt.type === name) || null;

    Object.defineProperty(Object.getPrototypeOf(navigator), 'mimeTypes', {
      get: () => fakeMimeTypeArray,
      configurable: true,
      enumerable: true,
    });
  } catch (_e) {
    // Silently ignore
  }
}
