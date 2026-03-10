# @phosra/sdk

Official TypeScript SDK for the Phosra child-safety API.

## Installation

Within the monorepo, `web/` and `browser/` resolve `@phosra/sdk` via npm workspaces — no manual install needed.

For external consumers:

```bash
npm install @phosra/sdk
```

## Quick Start

```ts
import { PhosraClient } from "@phosra/sdk";

// User-authenticated client (browser or server)
const phosra = new PhosraClient({ accessToken: "eyJ..." });

const families = await phosra.families.list();
const children = await phosra.children.list(families[0].id);
```

### Device Authentication

```ts
const phosra = PhosraClient.forDevice({ deviceKey: "dk_..." });
const policy = await phosra.devices.getPolicy();
```

### Token Refresh

```ts
const phosra = new PhosraClient({
  accessToken: token,
  onTokenExpired: async () => {
    const tokens = await phosra.auth.refresh({ refresh_token: stored });
    stored = tokens.refresh_token;
    return tokens.access_token;
  },
});
```

## Importing in `web/`

```ts
// Preferred — use the SDK client
import { PhosraClient } from "@phosra/sdk";

// Types only
import type { Family, Child, ChildPolicy } from "@phosra/sdk";
```

> **Note:** `web/src/lib/api.ts` is a legacy API client that predates this SDK.
> New code should import from `@phosra/sdk` instead. The legacy client will be
> migrated in a future PR.

## Importing in `browser/`

```ts
import { PhosraClient } from "@phosra/sdk";
```

The monorepo workspace config resolves `@phosra/sdk` to `packages/sdk` automatically.

## Available Resources

| Resource           | Methods                                       |
| ------------------ | --------------------------------------------- |
| `auth`             | register, login, refresh, logout, me           |
| `families`         | list, create, get, update, delete              |
| `children`         | list, create, get, update, delete, ageRatings  |
| `members`          | list, add, remove                              |
| `policies`         | list, create, get, update, delete, activate, pause, generateFromAge |
| `rules`            | list, create, update, delete, bulkUpsert       |
| `enforcement`      | trigger, listJobs, getJob, getResults, retry   |
| `platforms`        | list, get, byCategory, byCapability            |
| `compliance`       | list, connect, disconnect, verify              |
| `webhooks`         | list, create, test                             |
| `ratings`          | systems, forAge, convert                       |
| `standards`        | browse, adopt, remove                          |
| `setup`            | quick                                          |
| `devices`          | register, getPolicy, report                    |
| `reports`          | familyOverview                                 |
| `sources`          | list, connect, get, sync, disconnect           |

## Building

```bash
cd packages/sdk && npm run build
```
