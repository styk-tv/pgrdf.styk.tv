# Verbose ingest statistics

> JSONB report from an ingest run: triples loaded, dictionary cache
> hits, dictionary DB calls, batch count, elapsed milliseconds.

## What it does

`pgrdf.load_turtle_verbose(path TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL) → JSONB`
`pgrdf.parse_turtle_verbose(content TEXT, graph_id BIGINT, base_iri TEXT DEFAULT NULL) → JSONB`

The verbose variants of `load_turtle` and `parse_turtle` return a
structured JSONB report instead of an integer triple count.
The same parse + insert pipeline runs underneath.

## Why you'd use it

- **Project managers** — measure ingest cost empirically. Compare
  cold vs. warm loads. Plan capacity from observed numbers.
- **Data scientists** — verify the [shared-memory dictionary cache](/v0.5/storage/shmem-cache)
  is hitting on your workload before committing to a large ingest.
- **Ontologists** — see which ontologies parse fast and which
  hit the dictionary DB hard.

## Example

```sql
SELECT pgrdf.load_turtle_verbose(
  '/fixtures/ontologies/prov.ttl', 200,
  'http://www.w3.org/ns/prov#');
```

```json
{
  "triples": 1789,
  "dict_cache_hits": 4612,
  "dict_db_calls":   783,
  "quad_batches":    2,
  "elapsed_ms":      142.7
}
```

The same shape comes back from `pgrdf.parse_turtle_verbose` for
the inline-string variant.

## Reading the report

| Key | Meaning |
|---|---|
| `triples` | Triples accepted by the parser and queued for insert. |
| `dict_cache_hits` | Dictionary lookups served from the shared-memory cache. |
| `dict_db_calls` | Dictionary lookups that fell through to the `_pgrdf_dictionary` table. |
| `quad_batches` | Number of prepared-`INSERT` round-trips used to flush quads. |
| `elapsed_ms` | End-to-end wall-clock time inside the UDF. |

A healthy ingest of a well-known ontology shows
`dict_cache_hits` dominating `dict_db_calls` (warm cache reuse
across documents that share predicates), and `quad_batches`
proportional to triple count divided by the configured batch size.

## Tests

The verbose variant returns the same JSONB shape used by
[`pgrdf.stats()`](/v0.5/operations/stats); its dictionary-cache
fields are exercised by
[`tests/regression/sql/50-shmem-dict-cache.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/50-shmem-dict-cache.sql)
and
[`tests/regression/sql/52-bulk-ingest-perf.sql`](https://github.com/styk-tv/pgRDF/blob/main/tests/regression/sql/52-bulk-ingest-perf.sql).

## See also

- [Shared-memory dictionary cache](/v0.5/storage/shmem-cache).
- [Bulk ingest](/v0.5/storage/bulk-ingest).
