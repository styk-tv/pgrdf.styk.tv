# Compose with regular SQL

> `pgrdf.sparql(...)` is a set-returning function. You can JOIN it
> to a Postgres table, use it as a CTE, funnel its result into
> `INSERT INTO ... SELECT`, or wrap it in a view.

## What it does

Every UDF in the `pgrdf.*` schema is a regular Postgres function.
That means **every Postgres composition idiom works**:

- `pgrdf.sparql(...)` in a `FROM` clause as a row source.
- `WITH` CTEs that name SPARQL results.
- `JOIN` SPARQL output against your application tables.
- `INSERT INTO ... SELECT FROM pgrdf.sparql(...)` to materialise.
- `CREATE VIEW v AS SELECT ... FROM pgrdf.sparql(...)`.

The graph is just another table.

## Why you'd use it

- **Data scientists** — keep your feature pipelines in SQL. Pull
  graph features in alongside relational ones in the same query.
- **Application developers** — no separate query language for
  graph vs. relational concerns. One ORM, one connection pool.
- **Reporting / BI** — wrap SPARQL queries as views, point your
  BI tool at them.

## Example — JOIN graph data to your tables

```sql
WITH friends AS (
  SELECT * FROM pgrdf.sparql(
    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
     SELECT ?a ?b WHERE { ?a foaf:knows ?b }')
)
SELECT a.region, COUNT(*) AS knows_count
  FROM friends f
  JOIN app.users a ON a.iri = f."a"
 GROUP BY a.region
 ORDER BY knows_count DESC;
```

## Example — materialise a SPARQL result as a table

```sql
CREATE TABLE app.person_emails AS
SELECT
    (s ->> 'p') AS person_iri,
    (s ->> 'm') AS mailbox
  FROM pgrdf.sparql(
    'PREFIX foaf: <http://xmlns.com/foaf/0.1/>
     SELECT ?p ?m WHERE { ?p foaf:mbox ?m }') AS s;
```

## Example — wrap as a view

```sql
CREATE VIEW reports.engineers AS
SELECT
    (s ->> 'p') AS person,
    (s ->> 'n') AS name
  FROM pgrdf.sparql(
    'PREFIX ex: <http://example.com/>
     SELECT ?p ?n
       WHERE { ?p a ex:Engineer ; ex:name ?n }') AS s;

-- The view is now a first-class table-shaped object;
-- BI tools, ORMs, and grafana plug straight in.
SELECT * FROM reports.engineers ORDER BY name LIMIT 50;
```
