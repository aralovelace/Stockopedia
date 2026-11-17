import { runQuery } from "./interpreter";

const query = (expression: unknown, security = "ABC") =>
  JSON.stringify({ security, expression });

describe("runQuery", () => {
  it("multiplies an attribute by a number", () => {
    expect(runQuery(query({ fn: "*", a: "sales", b: 2 }))).toEqual({
      ok: true,
      value: 8,
    });
  });

  it("divides two attributes", () => {
    expect(runQuery(query({ fn: "/", a: "price", b: "eps" }, "BCD"))).toEqual({
      ok: true,
      value: 0.5,
    });
  });

  it("evaluates nested expressions", () => {
    const expression = {
      fn: "-",
      a: { fn: "-", a: "eps", b: "shares" },
      b: { fn: "-", a: "assets", b: "liabilities" },
    };
    expect(runQuery(query(expression, "CDE"))).toEqual({
      ok: true,
      value: -21,
    });
  });

  it("supports addition", () => {
    expect(runQuery(query({ fn: "+", a: 5, b: 2 }))).toEqual({
      ok: true,
      value: 7,
    });
  });

  it("returns an error for invalid JSON", () => {
    expect(runQuery('{"security": "ABC"')).toEqual({
      ok: false,
      error: "Invalid JSON.",
    });
  });

  it.each([
    ['{"wrong": 123, "security": "BCD"}'],
    [query({ fn: "%", a: 1, b: 2 })],
    [query({ fn: "+", a: 1 })],
  ])("returns an error for invalid DSL: %s", (text) => {
    const result = runQuery(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/^Invalid\. Expected/);
  });

  it("returns an error for an unknown security", () => {
    expect(runQuery(query({ fn: "*", a: "sales", b: 2 }, "ZZZ"))).toEqual({
      ok: false,
      error: 'Security "ZZZ" not found.',
    });
  });

  it("returns an error for an unknown attribute", () => {
    expect(runQuery(query({ fn: "*", a: "banana", b: 2 }))).toEqual({
      ok: false,
      error: 'Attribute "banana" not found.',
    });
  });

  it("returns an error when a fact is missing", () => {
    expect(
      runQuery(query({ fn: "+", a: "price", b: "shares" }, "JKL")),
    ).toEqual({ ok: false, error: 'No value for "shares" on this security.' });
  });
});
