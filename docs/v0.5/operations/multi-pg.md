# Multi-version Postgres support

> pgRDF builds against PostgreSQL **14, 15, 16, and 17**. The
> full test bar runs across all four in CI.

## Supported versions

| Postgres major | Status | Notes |
|---|---|---|
| 14 | ✅ supported | Active in CI matrix. |
| 15 | ✅ supported | Active in CI matrix. |
| 16 | ✅ supported | Active in CI matrix. |
| 17 | ✅ supported | Default in `compose-up`. |
| 18 | ⏳ deferred | pgrx 0.18.0 upstream still fails to build locally; see [ERRATA E-006](https://github.com/styk-tv/pgRDF/blob/main/specs/ERRATA.v0.2.md). Will land when pgrx ships a working 0.18.x. |

## What's tested where

| Layer | Versions covered |
|---|---|
| `just test` — pgrx integration | PG 14-17 |
| `just test-regression` — compose | PG 17 (the default compose target) |
| `just test-w3c` — W3C SPARQL conformance | PG 17 |
| `just test-lubm` | PG 17 |
| `just test-everything` | full sweep |

The release workflow ships per-PG binary tarballs:

```
pgrdf-<ver>-pg14-glibc-amd64.tar.gz
pgrdf-<ver>-pg14-glibc-arm64.tar.gz
pgrdf-<ver>-pg15-glibc-amd64.tar.gz
…
```

per [`SPEC.pgRDF.INSTALL.v0.2`](https://github.com/styk-tv/pgRDF/blob/main/specs/SPEC.pgRDF.INSTALL.v0.2.md).

## Which `cargo pgrx` feature to pass

pgrx uses per-PG features. When building or running tests
locally, pick one explicitly:

```bash
cargo pgrx run pg17 --features pg17
cargo pgrx test pg16 --features pg16
```

There is **no default feature** — `default = []` — to avoid the
"build silently picked the wrong PG version" failure mode.
