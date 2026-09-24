# Autism Family Exchange — ownership and migration handover

Checked 24 September 2026. This repository is owned by GitHub account `shah778877` and contains the AFE application source, pages, API routes, styles, public artwork, database schema and migrations, and dependency lockfile. The source was transferred in commit `1cfa161ca9d941aba7a81234ebc67bc45a722f24`. The missing non-secret Sites binding manifest was restored afterward.

## Current live site

- Domain: `autismfamilyexchange.co.uk`
- Current host: ChatGPT Sites project `appgprj_6ab26d02158481919ff38201daf63dfd`
- Current live version at inspection: 6; site remains running there.
- Access is currently restricted. Site ownership and control of the GitHub repo do not themselves transfer the hosting account or domain registrar.
- The code reads authenticated user identity from host-injected `oai-authenticated-user-*` headers. Sign in, sign out and callback endpoints are supplied by the current host. A different host must supply a new authentication system and update `app/chatgpt-auth.ts`, all protected routes, and the admin role mapping.
- `.openai/hosting.json` in this repository describes the *existing* Sites D1 binding for reproducibility. An independent deployment must replace that binding configuration with its own service settings.

## Live data found through the Sites management interface

| Resource | Current state |
| --- | --- |
| D1 `profiles` | 1 account row |
| D1 `listings` | 0 rows |
| D1 `listing_images` | 0 rows |
| D1 `support_messages` | Table absent at inspection, although the source defines it |
| Listing image objects | No listing image records; confirm storage independently before cutover |
| Public image assets | Source-controlled in `public/` |

The one account row contains private data, including identity, contact details and date of birth. It has **not** been committed to Git. Export it securely to the replacement database during migration; do not publish it or add plaintext customer records to the repository. Reconcile the old host user ID with the new provider's ID and retain the account's admin role.

The current production database is separate from Git. Schema and migrations in `drizzle/` are code, not a copy of live account data. The missing `support_messages` table means the current admin message feature needs its migration applied and checked before relying on it.

## To operate without ChatGPT Sites

1. Choose and provision an independent host that supports the server code, a SQL database, object storage for listing images, and an authentication provider. The application currently targets Cloudflare Workers, D1 and optional R2.
2. Replace host-injected ChatGPT sign-in with the new provider. Verify server-side identity, account ownership and admin authorization across every API route before accepting real users.
3. Apply the SQL migrations in order to the replacement database. Export the existing account securely from the current database, import it and map its identity to the new authentication system. Check all tables and record counts.
4. Configure image storage and its binding. Listing upload code expects `BUCKET`; the current Site only advertised a `DB` binding at inspection. Verify uploads and image retrieval in the new deployment.
5. Set deployment secrets in the host's secret manager. Do not commit tokens, passwords or customer data. Add a CI workflow only after the new hosting target and credentials are chosen.
6. Deploy from this GitHub repository, run sign-up, account, listing, upload, moderation and admin checks, and only then change the domain DNS at the registrar. Keep the current site running until the new one works.
7. Set independent automated database and image backups and document how to restore them. After cutover, remove the current hosting dependence if desired.

## Product status

The repository is a transferable code base. GitHub alone does not run the website, store the live database, authenticate members or own the domain. Payments, marketplace messaging and community chat are not established as finished production features by this handover. Verify them separately before launch.
