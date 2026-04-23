# CMS starter (full)

Co-hosted Control + Delivery on a single Bun runner, with zero-dependency
in-memory providers. Nothing persists across restarts — this is a starter
meant to be edited, not a production wiring.

## Run

```bash
cp .env.example .env
bun install
bun run dev
```

- Admin:    http://localhost:4999/cms/admin
- Sign in:  http://localhost:4999/cms/auth/login
- Tokens:   http://localhost:4999/cms/tokens
- Public:   http://localhost:4999/

## Wiring

| Concern         | Provider                                                    |
|-----------------|-------------------------------------------------------------|
| `CmsRepository` | `providers/InMemoryCmsRepository.ts`                        |
| `Media`         | `providers/InMemoryMedia.ts` (socle `Media` contract)       |
| Cookie auth     | `providers/BasicAuth.ts`                                    |
| Bearer tokens   | `TokenProvider` + `InMemoryApiTokenRepository` (socle)      |
| Auth composition| `CompositeAuthentication` (bearer, then cookie)             |

## What to swap first

- **Persistence** — `InMemoryCmsRepository` → `DefaultCmsRepository` (Mongo)
- **Media** — `InMemoryMedia` → a provider that speaks to S3/Cloudinary/etc.
- **Auth** — `BasicAuth` → `KeycloakConsumer` (OIDC)
- **Token storage** — `InMemoryApiTokenRepository` → `MongoApiTokenRepository`
