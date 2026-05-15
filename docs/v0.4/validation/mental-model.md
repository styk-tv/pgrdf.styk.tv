# The mental model

You author a **SHACL shapes graph** that says, in Turtle:

> "Every `foaf:Person` must have at least one `foaf:name`, and the
> name must be a string. Every `foaf:Person` must have at least
> one `foaf:mbox`, and the mailbox must be an IRI."

You load both the **data graph** and the **shapes graph** into
pgRDF as separate `graph_id`s. `pgrdf.validate(data, shapes)`
returns a report listing every node in the data graph that
violates a constraint, with:

- The offending **focus node** (the IRI being validated).
- The **property path** (where the violation occurred).
- The **value** that violated the constraint.
- The **source constraint component** (which rule fired).
- A human-readable **message**.

## The report shape

```json
{
  "conforms": false,
  "results": [
    {
      "focusNode":  "http://example.com/bob",
      "resultPath": "http://xmlns.com/foaf/0.1/mbox",
      "sourceConstraintComponent":
        "http://www.w3.org/ns/shacl#MinCountConstraintComponent",
      "resultSeverity": "http://www.w3.org/ns/shacl#Violation",
      "resultMessage": "Less than 1 value"
    }
  ]
}
```

When the graph conforms entirely:

```json
{ "conforms": true, "results": [] }
```

## Validation as a gate

Because the report is JSONB, you can build pipelines that gate
ingestion on `conforms = true`:

```sql
WITH r AS (SELECT pgrdf.validate(:data, :shapes) AS rep)
SELECT
  CASE WHEN (r.rep ->> 'conforms')::boolean
       THEN 'OK'
       ELSE 'REJECT'
  END AS verdict
  FROM r;
```

A failed validation can be logged, alerted, or rolled back inside
the same transaction.

[**Next — Worked example →**](/v0.4/validation/example)
