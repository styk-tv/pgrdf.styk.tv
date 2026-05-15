# Drop-in install

> Three files bind-mount onto a stock `postgres:17.4` image. No
> image rebuild. No second process. K8s variants land the same
> files via an init container.

## Three artefacts

Every pgRDF release ships three files per supported PG major /
architecture:

| File | Goes into the PG container at |
|---|---|
| `pgrdf.so` | `${pg_lib_dir}/pgrdf.so` |
| `pgrdf.control` | `${pg_share_dir}/extension/pgrdf.control` |
| `pgrdf--<version>.sql` | `${pg_share_dir}/extension/pgrdf--<version>.sql` |

That's it. No image rebuild. No CRD. No separate service.

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
--  → 0.4.0
```

## Kubernetes

The same three artefacts land via an **init container** that
fetches and unpacks the release tarball into a `share/extension`
emptyDir mount. See
[`SPEC.pgRDF.INSTALL.v0.2.md`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md)
§4 for the full pod spec.

## Release tarball layout

```
pgrdf-0.4.0-pg17-glibc-amd64.tar.gz
├── lib/pgrdf.so
├── share/extension/pgrdf.control
├── share/extension/pgrdf--0.4.0.sql
├── LICENSE
├── NOTICE
└── SHA256SUMS
```

Downloads via the [release page](https://github.com/styk-tv/pgRDF/releases).

## crates.io

pgRDF is also published on crates.io as
**[`pgrdf`](https://crates.io/crates/pgrdf)** for namespace
discoverability. Building from `cargo install` requires a
matching `pg_config` and the `--features pg17` flag — the
load-bearing distribution channel for production is the release
tarball above.
