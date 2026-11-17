import attributes from "../../data/attributes.json";
import factsData from "../../data/facts.json";
import securities from "../../data/securities.json";
import { Fact } from "../../models/fact";
import { operators } from "./operators";

type PriceArgs = string | number | Expression;

interface Expression {
  fn: string;
  a: PriceArgs;
  b: PriceArgs;
}

interface Query {
  security: string;
  expression: Expression;
}

export type Result = { ok: true; value: number } | { ok: false; error: string };

const facts: Fact[] = factsData.map((f) => ({
  securityId: f.security_id,
  attributeId: f.attribute_id,
  value: f.value,
}));

export function runQuery(text: string): Result {
  const json = parseJson(text);
  if (json === undefined) {
    return { ok: false, error: "Invalid JSON." };
  }

  if (!isQuery(json)) {
    return {
      ok: false,
      error:
        'Invalid. Expected {"security": "ABC", "expression": {"fn": "+", "a": ..., "b": ...}}.',
    };
  }

  const security = securities.find((s) => s.symbol === json.security);
  if (!security) {
    return { ok: false, error: `Security "${json.security}" not found.` };
  }

  return evaluate(json.expression, security.id);
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function evaluate(arg: PriceArgs, securityId: number): Result {
  if (typeof arg === "number") {
    return { ok: true, value: arg };
  }

  if (typeof arg === "string") {
    const attribute = attributes.find((a) => a.name === arg);
    if (!attribute) {
      return { ok: false, error: `Attribute "${arg}" not found.` };
    }

    const fact = facts.find(
      (f) => f.securityId === securityId && f.attributeId === attribute.id,
    );
    if (!fact) {
      return { ok: false, error: `No value for "${arg}" on this security.` };
    }

    return { ok: true, value: fact.value };
  }

  const a = evaluate(arg.a, securityId);
  if (!a.ok) {
    return a;
  }

  const b = evaluate(arg.b, securityId);
  if (!b.ok) {
    return b;
  }

  return { ok: true, value: operators[arg.fn](a.value, b.value) };
}

function isQuery(value: unknown): value is Query {
  const q = value as Query;
  return (
    typeof q === "object" &&
    q !== null &&
    typeof q.security === "string" &&
    isExpression(q.expression)
  );
}

function isExpression(value: unknown): value is Expression {
  const e = value as Expression;
  return (
    typeof e === "object" &&
    e !== null &&
    e.fn in operators &&
    isArgument(e.a) &&
    isArgument(e.b)
  );
}

function isArgument(value: unknown): boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    isExpression(value)
  );
}