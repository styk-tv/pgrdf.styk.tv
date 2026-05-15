# Report as data

> The validation report is JSONB. Violations are queryable,
> joinable, persistable, alertable — just like any Postgres row.

## What it does

`pgrdf.validate` returns a single JSONB document. The
`results` field is an array; each element is one violation.
Postgres' built-in JSONB operators and `jsonb_array_elements`
let you treat the violations as a virtual table.

## Why you'd use it

- **Operators** — route violations to a notification, archive
  them in an audit table, or aggregate them across runs without
  parsing a non-database artefact.
- **Data scientists** — bucket violations by class or property
  in a single SQL query.
- **Project managers** — auditable, time-stamped evidence of
  data conformance over the long haul.

## Examples

### List who violated which constraint

```sql
WITH r AS (SELECT pgrdf.validate(1, 2) AS rep)
SELECT
    v ->> 'focusNode'    AS who,
    v ->> 'resultPath'   AS path,
    v ->> 'resultMessage' AS why
  FROM r,
       jsonb_array_elements(r.rep -> 'results') v;
```

### Count violations per constraint component

```sql
WITH r AS (SELECT pgrdf.validate(1, 2) AS rep)
SELECT
    v ->> 'sourceConstraintComponent' AS component,
    count(*)                          AS n
  FROM r,
       jsonb_array_elements(r.rep -> 'results') v
  GROUP BY component
  ORDER BY n DESC;
```

### Persist violations into a history table

```sql
CREATE TABLE audit.validation_runs (
    run_at      timestamptz NOT NULL DEFAULT now(),
    data_graph  bigint NOT NULL,
    shapes_graph bigint NOT NULL,
    conforms    boolean NOT NULL,
    report      jsonb NOT NULL
);

INSERT INTO audit.validation_runs (data_graph, shapes_graph, conforms, report)
WITH r AS (SELECT pgrdf.validate(1, 2) AS rep)
SELECT 1, 2,
       (r.rep ->> 'conforms')::boolean,
       r.rep
  FROM r;
```

### Gate ingestion inside a transaction

```sql
BEGIN;
  -- load some data into graph 1 ...
  WITH r AS (SELECT pgrdf.validate(1, 2) AS rep)
  SELECT CASE WHEN (r.rep ->> 'conforms')::boolean
              THEN 'OK'
              ELSE error_message_or_rollback() END
    FROM r;
COMMIT;
```

`error_message_or_rollback()` is your own user-defined function
that raises an exception when validation fails — Postgres will
roll back the transaction.
