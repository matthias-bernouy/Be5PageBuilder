/**
 * Starter wiring for a full CMS app: Control + Delivery co-hosted, with
 * zero-dependency in-memory providers and a username/password + bearer
 * token authentication stack.
 *
 * Everything below is meant to be swapped as the project grows:
 *   - `InMemoryCmsRepository`       → `DefaultCmsRepository` (MongoDB) or custom
 *   - `StMediaProvider` storage     → GridFS, S3, Cloudinary, … (second arg)
 *   - `StMediaConsumer`             → any Media consumer matching your provider
 *   - `BasicAuth`                   → `KeycloakConsumer` (from `@bernouy/socle`) or custom
 *   - `InMemoryApiTokenRepository`  → `MongoApiTokenRepository`
 *
 * Media uses a Provider/Consumer split: `InMemoryMediaProvider` owns the
 * storage + endpoints, mounted as a standalone service; `InMemoryMediaConsumer`
 * is what Cms and Delivery receive and what the browser gets via
 * `window._cms.Media` after server → browser hydration. Both surfaces go
 * through HTTP, so the Media state is never duplicated.
 *
 * State lives in-process and is lost on restart. Good for local development
 * and demos, not for production.
 */

import { Cms, DeliveryCms, registerDeliveryEndpoints } from "@bernouy/cms";
import {
    DefaultRunner,
    CompositeAuthentication,
    TokenProvider,
    InMemoryApiTokenRepository,
    StMediaProvider,
    StMediaConsumer,
} from "@bernouy/socle";

import { InMemoryCmsRepository }   from "./providers/InMemoryCmsRepository";
import { BasicAuth }               from "./providers/BasicAuth";
import type { CMS_ROLES }          from "@bernouy/cms";

const PORT          = parseInt(process.env.PORT  ?? "4999", 10);
const ADMIN_USER    = process.env.ADMIN_USERNAME  ?? "admin";
const ADMIN_PASS    = process.env.ADMIN_PASSWORD  ?? "admin";
const CMS_PREFIX    = process.env.CMS_PREFIX      ?? "/cms";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

const MEDIA_PREFIX = `${CMS_PREFIX}/media`;

const repository = new InMemoryCmsRepository();
const rootRunner = new DefaultRunner();

// ── Media service (Provider) ─────────────────────────────────────────────
// Independent HTTP surface mounted at `<CMS_PREFIX>/media`. Not scoped under
// Control's auth-guarded group — the provider owns its own access model
// (no auth at all in this starter; switch to token or cookie gating when
// you're ready).

rootRunner.group(MEDIA_PREFIX, (m) => {
    // `StMediaProvider` defaults to `InMemoryMediaStorage` — swap the
    // second arg for a persistent backend (GridFS, S3, …) when you need to
    // survive restarts.
    new StMediaProvider(m);
});

// Shared HTTP client. Same instance passed to Cms and Delivery; the same
// class is serialized to the browser's `window._cms.Media` by the admin
// shell so every surface talks to the single Provider via HTTP.
const media = new StMediaConsumer(MEDIA_PREFIX);

// ── Control (admin UI + API) ─────────────────────────────────────────────

rootRunner.group(CMS_PREFIX, (control) => {

    const basicAuth = new BasicAuth(control, {
        users: [{
            username:     ADMIN_USER,
            passwordHash: Bun.password.hashSync(ADMIN_PASS),
            role:         "admin" satisfies CMS_ROLES,
            displayName:  "Admin",
        }],
        cookieSecure: COOKIE_SECURE,
    });

    const tokenProvider = new TokenProvider<CMS_ROLES>(control, {
        inner:      basicAuth,
        repository: new InMemoryApiTokenRepository<CMS_ROLES>(),
        basePath:   "/tokens",
    });

    // Order matters: bearer is checked first so API clients short-circuit
    // the cookie lookup. `displayName` makes `basicAuth` the browser-login
    // option surfaced on the chooser page (when more than one exists).
    const auth = new CompositeAuthentication<CMS_ROLES>(control, {
        children: [
            { auth: tokenProvider },
            { auth: basicAuth, displayName: "Sign in" },
        ],
    });

    new Cms(control, repository, auth, media, {
        deliveryUrl: `http://localhost:${PORT}`,
    });
});

// ── Delivery (public rendering) ──────────────────────────────────────────

const delivery = new DeliveryCms({
    runner:     rootRunner,
    repository,
    media,
});
registerDeliveryEndpoints(delivery);

// ── Go ───────────────────────────────────────────────────────────────────

rootRunner.start(PORT);
console.log(`CMS running on http://localhost:${PORT}`);
console.log(`  - admin  → http://localhost:${PORT}${CMS_PREFIX}/admin`);
console.log(`  - login  → http://localhost:${PORT}${CMS_PREFIX}/auth/login`);
console.log(`  - tokens → http://localhost:${PORT}${CMS_PREFIX}/tokens`);
console.log(`  - media  → http://localhost:${PORT}${MEDIA_PREFIX}`);
