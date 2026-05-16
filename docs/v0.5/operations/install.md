# Drop-in install

> Three files **per-file `:ro` bind-mount** onto a stock
> `postgres:17.4-bookworm` image. No image rebuild. No second
> process. Pull them from a GitHub release tarball **or** the
> anonymous OCI bundle. K8s variants land the same files via an
> init container.

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

## Two ways to get the artefacts

### GitHub release tarballs

The v0.5.0 release is the **Latest** release and ships eight
tarballs — `pg14`–`pg17` × `amd64`/`arm64` — plus a
`SHA256SUMS`. Download from the
[release page](https://github.com/styk-tv/pgRDF/releases),
verify against `SHA256SUMS`, unpack, and per-file `:ro`
bind-mount the three artefacts.

### Anonymous OCI bundle

The same artefacts are published as an **anonymously-pullable
OCI artifact** at `ghcr.io/styk-tv/pgrdf-bundle` — zero
credentials, no login:

```bash
# Multi-arch index (resolves to your platform):
oras pull ghcr.io/styk-tv/pgrdf-bundle:v0.5.0

# Or pin an exact PG major + arch:
oras pull ghcr.io/styk-tv/pgrdf-bundle:0.5.0-pg17-amd64
```

Available tags: `:0.5.0`, `:v0.5.0`, and
`:0.5.0-pg{14,15,16,17}-{amd64,arm64}`. For reproducible
deployments, **digest-pin** the artifact
(`ghcr.io/styk-tv/pgrdf-bundle@sha256:…`) rather than tracking a
moving tag. The bundle is public — no PAT, no `docker login`.

## Local — docker compose

The repository's [`compose/`](https://github.com/styk-tv/pgRDF/tree/main/compose)
tree contains a stock `postgres:17.4` compose file with the three
artefacts bind-mounted. From the pgRDF repo:

```bash
just build-ext        # builds pgrdf.{so,control,sql} in a Linux container
just compose-up       # docker / podman compose up -d
just psql             # opens a psql shell to the database
```

Inside psql:

```sql
CREATE EXTENSION pgrdf;
SELECT pgrdf.version();
--  → 0.5.0
```

## Kubernetes

The same three artefacts land via an **init container** that
fetches and unpacks the release tarball into a `share/extension`
emptyDir mount. See
[`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md)
§4 for the full pod spec.

## Release tarball layout

```
pgrdf-0.5.0-pg17-glibc-amd64.tar.gz
├── lib/pgrdf.so
├── share/extension/pgrdf.control
├── share/extension/pgrdf--0.5.0.sql
├── LICENSE
├── NOTICE
└── SHA256SUMS
```

Downloads via the [release page](https://github.com/styk-tv/pgRDF/releases)
(v0.5.0 is the **Latest** release), or the equivalent OCI
artifact `ghcr.io/styk-tv/pgrdf-bundle:v0.5.0`.

## crates.io

The crates.io name **[`pgrdf`](https://crates.io/crates/pgrdf)**
is held as a namespace placeholder. A crates.io publish is
**intentionally deferred to v0.6** and is **not** the
consumption path: pgRDF is a `pgrx`/cdylib Postgres extension,
so the load-bearing distribution channels are the per-PG release
tarball and the anonymous OCI bundle above — both ship a
prebuilt `.so` you bind-mount, with no Rust toolchain on the
database host.
