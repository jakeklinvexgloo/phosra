/**
 * Permissions API evasion
 *
 * In headless / automated browsers the Notification permission often returns
 * 'denied' instantly, which is a strong automation signal.  We override
 * `Permissions.prototype.query` to return 'prompt' for the notification
 * permission, matching a first-visit user on a stock Chrome install.
 */
export default function permissionsApi(): void;
