# Stockopedia Take-Home — JSON DSL Interpreter

A small interpreter for a JSON-based DSL that evaluates arithmetic expressions over a fixed set of
securities, attributes and facts.

## A note on AI use, up front

I want to be upfront: I used a lot of AI help on this challenge.

I struggled at first to understand how the interpreter was meant to work, so I asked an AI
assistant to explain it to me. Once that clicked I worked on the implementation, but I leaned on
AI heavily throughout — both to understand the problem and to get to the solution. I also asked an
AI agent to write the tests, because I wasn't confident my implementation was correct and I wanted
something that would tell me whether it worked.

I'd rather you know that than guess at it. I'm happy to talk through any part of the code.

## What was built

Two new files hold the whole implementation:

- **`lib/dsl/interpreter.ts`** — parses the input text, validates it against the DSL schema, resolves
  the security, and recursively evaluates the expression tree. Returns a discriminated union,
  `Result = { ok: true; value: number } | { ok: false; error: string }`, so every failure is a value
  rather than an exception.
- **`lib/dsl/operators.ts`** — the four arithmetic operators (`+`, `-`, `*`, `/`) as a lookup table.
  This doubles as the validator for `fn`: an operator is valid precisely because it's a key here.

`app/page.tsx` was then wired up to call `runQuery` and render either the value or the error message.

All four stated requirements are covered:

| Requirement | Where it's handled |
| --- | --- |
| Example expressions give the correct result | `evaluate` in `interpreter.ts` (verified as 8, 0.5 and -21) |
| Malformed JSON is reported | `parseJson` returns `undefined` → `"Invalid JSON."` |
| Schema-valid-JSON-but-invalid-DSL is reported | `isQuery` / `isExpression` / `isArgument` → `"Invalid. Expected …"` |
| Security and attribute lookup failures are reported | `"Security \"ZZZ\" not found."` / `"Attribute \"banana\" not found."`, plus `"No value for \"shares\" on this security."` when the fact is missing |

## What the AI actually did

Being specific, since this is the part I'd want to know if I were reading someone else's submission:

- **Explaining the problem.** Before writing anything, I had the DSL and the data model explained to
  me until I understood what "one fact per security per attribute" meant and how a nested expression
  should fold down to a single number. This was most of the value I got from AI.
- **Shaping the implementation.**  I have AI helped me what the solution would look like until I get it
- **Writing all the tests.** Every test here was AI-written: `lib/dsl/interpreter.spec.ts` from
  scratch, and `app/page.spec.tsx`, where the boilerplate left an `xit` stub marked
  `// TODO: Complete this test suite once implementation is complete`. I read them and they look
  reasonable to me, but I didn't write them, just to make sure I did the solution correctly.
## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npx jest         # 20 tests, 2 suites — all passing
npx tsc --noEmit # clean
```


## Developing

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
