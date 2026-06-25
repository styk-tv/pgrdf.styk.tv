# Drop-in install

> Three files **per-file `:ro` bind-mount** onto a stock
> `postgres:17` image. No image rebuild. No second process.
> Pull them from the anonymous OCI bundle, a per-PG GitHub
> release tarball, or PGXN. K8s variants land the same files via
> an init container. One `postgresql.conf` line is required:
> `shared_preload_libraries = 'pgrdf'`.

The current release is **v0.6.14** on PostgreSQL 17.

## Three artefacts

Every pgRDF release ships three files per supported PG major /
architecture. **Bind-mount each file individually as read-only**
— never a directory mount (a directory mount would shadow the
image's own `extension/` contents):

| File | Goes into the PG container at |
|---|---|
| `pgrdf.so` | `${pg_lib_dir}/pgrdf.so` |
| `pgrdf.control` | `${pg_share_dir}/extension/pgrdf.control` |
| `pgrdf--<version>.sql` | `${pg_share_dir}/extension/pgrdf--<version>.sql` |

That's it. No image rebuild. No CRD. No separate service.

## Required `postgresql.conf` change

pgRDF **must** be listed in `shared_preload_libraries`. The
preload runs `_PG_init()` in the postmaster context, which
registers two shared-memory facilities that the rest of the
extension depends on:

- the **shared-memory dictionary cache** (the cross-backend term
  cache surfaced by [`pgrdf.stats()`](/v0.6/operations/stats)), and
- the **staged loader's background-worker pool** — the
  multi-backend job-control segment the staged bulk importer
  spawns its workers from.

Without the preload, the first call into any pgRDF function
panics with `PgAtomic was not initialized`, and the staged
loader cannot spawn its workers.

```ini
# postgresql.conf
shared_preload_libraries = 'pgrdf'         # pgRDF alone
# or, if pgCK is also installed (order matters — pgrdf first):
shared_preload_libraries = 'pgrdf,pgck'
```

A **server restart** (not a reload) is required after editing
this line — preload happens at postmaster startup. Verify after
restart:

```sql
SHOW shared_preload_libraries;             -- must contain 'pgrdf'
```

The `just compose-up` path below bakes this line into the bundled
compose file; only own-Postgres installs edit `postgresql.conf`
by hand.

## No host tuning beyond the preload line

New in the v0.6 line: the staged bulk loader **self-tunes** its
`work_mem` and parallelism to the host it runs on. A full load —
up to Wikidata scale — works **out-of-the-box on stock
PostgreSQL** with no `postgresql.conf` hand-tuning beyond the one
`shared_preload_libraries` line above. There are no mandatory
planner hints, no manual `work_mem` sizing, no per-load knobs to
set before a large ingest.

## Three ways to get the artefacts

### Anonymous OCI bundle

The artefacts are published as an **anonymously-pullable OCI
artifact** at `ghcr.io/styk-tv/pgrdf-bundle` — zero credentials,
no `docker login`, no PAT:

```bash
# Multi-arch index (resolves to your platform):
oras pull ghcr.io/styk-tv/pgrdf-bundle:0.6.14

# Or pin an exact PG major + arch:
oras pull ghcr.io/styk-tv/pgrdf-bundle:0.6.14-pg17-amd64
```

Available tags: `:0.6.14`, `:v0.6.14`, and the per-leaf
`:0.6.14-pg17-{amd64,arm64}`. Every published digest carries a
verifiable **SLSA Build Provenance v1** attestation, recorded in
Sigstore's Rekor transparency log. Verify any digest before you
trust it:

```bash
# Aggregate index (multi-arch):
gh attestation verify oci://ghcr.io/styk-tv/pgrdf-bundle:0.6.14 \
  --repo styk-tv/pgRDF

# A specific arch leaf:
gh attestation verify oci://ghcr.io/styk-tv/pgrdf-bundle:0.6.14-pg17-amd64 \
  --repo styk-tv/pgRDF
```

A successful verify means the artifact was signed by GitHub's
Fulcio CA against the OIDC token of the v0.6.14 publish workflow
run, recorded in Rekor, with the subject digest matching the
artifact you pulled. For reproducible deployments, **digest-pin**
the artifact (`ghcr.io/styk-tv/pgrdf-bundle@sha256:…`) rather than
tracking a moving tag — tagged versions are immutable on GHCR, and
there is **no `latest` synonym** on the extension artifact: pin by
`pg`×`arch` explicitly.

### GitHub release tarballs

The same artefacts ship as per-PG binary tarballs on the
[release page](https://github.com/styk-tv/pgRDF/releases), plus a
`SHA256SUMS`. During the PostgreSQL 17 stabilization window the
published leaves are pg17 × `amd64`/`arm64`; the pg14/15/16
leaves are paused (see
[Multi-version Postgres support](/v0.6/operations/multi-pg)).
Download, verify against `SHA256SUMS`, unpack, and per-file `:ro`
bind-mount the three artefacts.

### PGXN

pgRDF is also distributed through the
[PostgreSQL Extension Network](https://pgxn.org/):

```bash
pgxn install pgrdf
```

## Local — docker compose

The repository's [`compose/`](https://github.com/styk-tv/pgRDF/tree/main/compose)
tree contains a stock `postgres:17` compose file with the three
artefacts bind-mounted and `shared_preload_libraries = 'pgrdf'`
already set. From the pgRDF repo:

```bash
just build-ext        # builds pgrdf.{so,control,sql} in a Linux container
just compose-up       # docker / podman compose up -d
just psql             # opens a psql shell to the database
```

Inside psql:

```sql
CREATE EXTENSION pgrdf;
SELECT pgrdf.version();
--  → 0.6.14
```

## Kubernetes

The same three artefacts land via an **init container** that
fetches and unpacks the release tarball into a `share/extension`
emptyDir mount, with `shared_preload_libraries = 'pgrdf'` set on
the postgres container's command. See
[`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md)
§5 for the full pod spec.

## Release tarball layout

```
pgrdf-0.6.14-pg17-glibc-amd64.tar.gz
├── lib/pgrdf.so
├── share/extension/pgrdf.control
├── share/extension/pgrdf--0.6.14.sql
├── LICENSE
├── NOTICE
└── SHA256SUMS
```

Downloads via the
[release page](https://github.com/styk-tv/pgRDF/releases), or the
equivalent OCI artifact `ghcr.io/styk-tv/pgrdf-bundle:0.6.14`.

## Verifying conformance

After install, run the conformance checklist — all three checks
are gated in CI by
[`tests/regression/sql/00-smoke.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/00-smoke.sql):

```bash
psql -c "SELECT extversion FROM pg_extension WHERE extname='pgrdf';"   # ≡ release version
psql -c "\dx pgrdf"                                                     # extension present
psql -c "SHOW shared_preload_libraries;"                                # contains pgrdf
```
