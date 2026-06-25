---
title: Building a chain — how to design a semantic process
description: A method for composing pgRDF verbs into a semantic process — start from the output you need, pick the end verb, work backwards to the preconditions, make the scaling decision, and map each verb to its UDF. With the shape vocabulary every chain shares.
---

# <span class="material-symbols-outlined icon-blue">account_tree</span>Building a chain

> A semantic process in pgRDF is a **chain of verbs**. This page is the
> method: how to go from *"what do I need?"* to a concrete chain you
> can run, every time.

## The shape every chain shares

Read a chain left to right. Each position has a name — use these when
you reason about a process:

```
  Source            Sealed graph         Sized graph          Output
   │                     │                     │                  │
 Import ─▶ Seal ─▶ [ Carve ─▶ Unload ] ─▶ Reason ─▶ Validate ─▶ Query
   └─ parallel ─┘      └─ roadmap ─┘      └── single-threaded ──┘
```

- **Head** — `Import → Seal`: get RDF in and make it query-ready. Always present, always parallel.
- **Waist** — `Carve → Unload`: right-size the graph. Present **only when the source is larger than one backend can reason over**. [Roadmap](/v0.6/process/carve).
- **Tail** — `Reason → Validate → Query`: the semantic work. Single-threaded for Reason/Validate, so it runs on the *sized* graph.

When you say "which step am I on", name the position: head, waist, or
tail.

## The method — design backwards

1. **Name the output.** What does the caller need — solution rows
   ([Query](/v0.6/process/query)), a conformance verdict
   ([Validate](/v0.6/process/validate)), or entailed facts written back
   ([Reason](/v0.6/process/reason))? That fixes the **tail**.
2. **Work backwards to preconditions.** Validate needs a shapes graph.
   Reason needs a profile and a *sized* graph. Query needs a sealed
   graph. Everything needs Import. Each precondition adds a verb to the
   left.
3. **Make the scaling decision.** Does the graph fit your box for the
   single-threaded tail? If yes → no waist, you are done. If no → add
   the **waist**: Carve a slice, Unload the source, reason over the
   slice. This is the one decision that changes the shape.
4. **Map verbs to UDFs.** Walk the chain left to right and write the
   call for each — [`load_turtle_staged_run`](/v0.6/storage/staged-loader)
   for Import, the [SQL example on each verb page](/v0.6/process/import)
   for the rest.

## Worked example

> *"Validate a 30M-triple ontology against SHACL shapes, after OWL-RL
> reasoning, and return the violations."*

1. **Output** → a conformance report → tail ends at **Validate**.
2. **Backwards** → Validate needs the *entailed* graph → add **Reason**
   before it; Reason and Validate need a sealed graph → add
   **Import → Seal**.
3. **Scaling** → 30M triples fits one backend → **no waist**.
4. **Chain** → `Import → Seal → Reason → Validate`:

```sql
SELECT pgrdf.add_graph(10);
SELECT pgrdf.load_turtle('/data/ontology.ttl', 10);   -- Import + Seal
SELECT pgrdf.materialize(10, 'owl-rl');                -- Reason
SELECT pgrdf.validate(10, 11);                         -- Validate (shapes in graph 11)
```

That is the [Load → Validate → Query](/v0.6/process/pattern-validate)
pattern. Had the source been 8.2 B instead of 30 M, step 3 would have
flipped to *no* and added the [carve waist](/v0.6/process/pattern-carve).

## See also

- [Choosing a process](/v0.6/process/choosing) — pick the pattern from your goal and scale.
- [The patterns](/v0.6/process/pattern-load-query) — the four worked chains.
- [Overview](/v0.6/process/) — the verb model and the two scaling classes.
