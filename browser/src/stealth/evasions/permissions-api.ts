/**
 * Permissions API evasion
 *
 * In headless / automated browsers the Notification permission often returns
 * 'denied' instantly, which is a strong automation signal.  We override
 * `Permissions.prototype.query` to return 'prompt' for the notification
 * permission, matching a first-visit user on a stock Chrome install.
 */
export default function permissionsApi(): void {
  try {
    const originalQuery = Permissions.prototype.query;

    Permissions.prototype.query = function (
      permissionDesc: PermissionDescriptor,
    ): Promise<PermissionStatus> {
      if (permissionDesc.name === 'notifications') {
        // Resolve with a synthetic PermissionStatus-like object
        return Promise.resolve({
          state: 'prompt',
          name: 'notifications',
          onchange: null,
          addEventListener: EventTarget.prototype.addEventListener.bind(this),
          removeEventListener:
            EventTarget.prototype.removeEventListener.bind(this),
          dispatchEvent: EventTarget.prototype.dispatchEvent.bind(this),
        } as unknown as PermissionStatus);
      }

      // For all other permissions, fall through to the real implementation
      return originalQuery.call(this, permissionDesc);
    };
  } catch (_e) {
    // Silently ignore
  }
}
