# Multi-version Postgres support

> pgRDF builds against PostgreSQL **14, 15, 16, and 17**.
> During the v0.6 line, **PostgreSQL 17 is the supported head**:
> the pg14/15/16 build matrix is temporarily paused under a
> stabilization window, with the head test bar — **294 pgrx + 93
> pg_regress + 51 W3C-SPARQL + 25 W3C SHACL Core + 3 LUBM** —
> running on PostgreSQL 17 in CI.

## The pg17-only stabilization window

The v0.6 bulk-ingest line (streaming loader, native staged
background-worker loader, dictionary-btree fix, self-tuning)
moves fast, and each change is validated against PostgreSQL 17.
To keep the release cadence tight, the **pg14 / pg15 / pg16 build
matrix is paused** for the duration of the stabilization window.

- **PostgreSQL 17 is the supported head** — the published OCI
  bundle, release tarballs, and `LATEST.md` track pg17.
- The paused pg14/15/16 build steps are **preserved in the CI
  workflow YAML as comments**, not deleted — they resume once the
  v0.6 ingest surface is stable, restoring the four-major matrix.

## Supported versions

| Postgres major | Status | Notes |
|---|---|---|
| 14 | ⏸ paused | Build leaf paused during the stabilization window; preserved in CI YAML comments, resumes once the matrix is stable. |
| 15 | ⏸ paused | As above. |
| 16 | ⏸ paused | As above. |
| 17 | ✅ supported head | Active in CI; default in `compose-up`; the published artifact. |
| 18 | ⏳ v0.6-FUTURE | Held to the pgrx 0.16 pin; pgrx 0.18.x does not yet build cleanly upstream. Documented in [ERRATA E-006](https://github.com/styk-tv/pgRDF/blob/main/specs/ERRATA.v0.2.md). Lands once pgrx ships a working 0.18.x — an upstream gate, not a pgRDF gap. |

## What's tested at the head

| Layer | Coverage |
|---|---|
| `just test` — pgrx integration | PostgreSQL 17 (head) |
| `just test-regression` — compose | PostgreSQL 17 (the compose target) |
| `just test-w3c` — W3C SPARQL conformance | PostgreSQL 17 |
| `just test-lubm` | PostgreSQL 17 |
| `just test-everything` | full sweep at the head |

## Which `cargo pgrx` feature to pass

pgrx uses per-PG features. When building or running tests
locally, pick one explicitly:

```bash
cargo pgrx run pg17 --features pg17
cargo pgrx test pg17 --features pg17
```

There is **no default feature** — `default = []` — to avoid the
"build silently picked the wrong PG version" failure mode. Once
the matrix resumes, the same per-PG features (`pg14` … `pg16`)
return for cross-version builds.
