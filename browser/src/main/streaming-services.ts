/**
 * Static registry of streaming services supported for credential auto-fill.
 *
 * Each service defines login URL patterns (checked against `did-navigate` URLs)
 * and CSS selectors for the username/email and password fields on the login page.
 */

export interface StreamingService {
  id: string;
  displayName: string;
  /** URL patterns that indicate a login page. Matched with `url.includes(pattern)`. */
  loginUrls: string[];
  /** CSS selectors for auto-fill injection. */
  selectors: {
    username: string;
    password: string;
    /** Optional submit button selector. Falls back to generic detection if omitted. */
    submit?: string;
  };
}

export const STREAMING_SERVICES: StreamingService[] = [
  {
    id: 'netflix',
    displayName: 'Netflix',
    loginUrls: ['netflix.com/login'],
    selectors: {
      username: 'input[name="userLoginId"], input[data-uia="login-field"]',
      password: 'input[name="password"], input[data-uia="password-field"]',
      submit: 'button[data-uia="login-submit-button"], button[type="submit"]',
    },
  },
  {
    id: 'disneyplus',
    displayName: 'Disney+',
    loginUrls: ['disneyplus.com/login', 'disneyplus.com/identity'],
    selectors: {
      username: 'input[type="email"], input[data-testid="email-input"]',
      password: 'input[type="password"], input[data-testid="password-input"]',
    },
  },
  {
    id: 'hulu',
    displayName: 'Hulu',
    loginUrls: ['auth.hulu.com', 'hulu.com/login'],
    selectors: {
      username: 'input[type="email"], input[name="email"]',
      password: 'input[type="password"], input[name="password"]',
    },
  },
  {
    id: 'max',
    displayName: 'Max',
    loginUrls: ['max.com/login', 'max.com/sign-in'],
    selectors: {
      username: 'input[type="email"], input[name="email"]',
      password: 'input[type="password"], input[name="password"]',
    },
  },
  {
    id: 'paramountplus',
    displayName: 'Paramount+',
    loginUrls: ['paramountplus.com/account/signin', 'paramountplus.com/login'],
    selectors: {
      username: 'input[type="email"], input[name="email"]',
      password: 'input[type="password"], input[name="password"]',
    },
  },
  {
    id: 'youtube',
    displayName: 'YouTube',
    loginUrls: ['accounts.google.com/v3/signin', 'accounts.google.com/signin'],
    selectors: {
      username: 'input[type="email"], input[name="identifier"]',
      password: 'input[type="password"], input[name="Passwd"]',
    },
  },
  {
    id: 'appletv',
    displayName: 'Apple TV+',
    loginUrls: ['idmsa.apple.com/appleauth', 'tv.apple.com/login'],
    selectors: {
      username: 'input[type="text"]#account_name_text_field, input[id="appleId"]',
      password: 'input[type="password"]#password_text_field, input[id="password"]',
    },
  },
  {
    id: 'primevideo',
    displayName: 'Amazon Prime Video',
    loginUrls: ['amazon.com/ap/signin', 'amazon.com/ap/mfa', 'amazon.com/gp/video/profiles', 'primevideo.com/auth/signin'],
    selectors: {
      username: 'input[name="email"], input[type="email"], input#ap_email',
      password: 'input[name="password"], input[type="password"], input#ap_password',
      submit: 'input#signInSubmit, input#continue, button#signInSubmit, button[type="submit"]',
    },
  },
];

/** Map of service ID → StreamingService for quick lookup. */
const SERVICE_MAP = new Map<string, StreamingService>(
  STREAMING_SERVICES.map((s) => [s.id, s]),
);

/** Default selectors used for custom providers. */
export const DEFAULT_SELECTORS = {
  username: 'input[type="email"], input[name="email"], input[name="username"], input[type="text"][autocomplete="username"]',
  password: 'input[type="password"], input[name="password"]',
};

/** Find the service whose login URL pattern matches the given URL, if any. */
export function matchUrlToService(
  url: string,
  customServices?: StreamingService[],
): StreamingService | undefined {
  const lower = url.toLowerCase();

  // Check built-in services first
  const builtIn = STREAMING_SERVICES.find((s) =>
    s.loginUrls.some((pattern) => lower.includes(pattern)),
  );
  if (builtIn) return builtIn;

  // Then check custom services
  if (customServices) {
    return customServices.find((s) =>
      s.loginUrls.some((pattern) => lower.includes(pattern)),
    );
  }

  return undefined;
}

/** Get a built-in service by its ID. */
export function getServiceById(id: string): StreamingService | undefined {
  return SERVICE_MAP.get(id);
}

/** Check if a service ID belongs to a built-in service. */
export function isBuiltInService(id: string): boolean {
  return SERVICE_MAP.has(id);
}
