import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import Home from "./page";

describe("Index page", () => {
  beforeEach(() => {
    render(<Home />);
  });

  it("should set the initial value of the expression", () => {
    expect(screen.getByTestId("expression-input")).toHaveValue(`{
  "expression": {"fn": "*", "a": "sales", "b": 2},
  "security": "ABC"
}`);
  });

  it("should set the expression when an example button is clicked", () => {
    fireEvent.click(screen.getByTestId("button-divide"));

    expect(screen.getByTestId("expression-input")).toHaveValue(`{
  "expression": {"fn": "/", "a": "price", "b": "eps"},
  "security": "BCD"
}`);
  });

  it.each([
    ["multiply", "8"],
    ["divide", "0.5"],
    ["nested", "-21"],
  ])(
    'should evaluate the "%s" example when "run" is clicked',
    (id, expected) => {
      fireEvent.click(screen.getByTestId(`button-${id}`));
      fireEvent.click(screen.getByTestId("run-button"));

      expect(screen.getByTestId("output")).toHaveValue(expected);
      expect(screen.getByTestId("success-message")).toBeInTheDocument();
      expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
    },
  );

  it.each([
    ["invalid-json", /Invalid JSON/],
    ["invalid-dsl", /Invalid\. Expected/],
    ["missing-security", /Security "ZZZ" not found/],
  ])('should show an error for the "%s" example', (id, message) => {
    fireEvent.click(screen.getByTestId(`button-${id}`));
    fireEvent.click(screen.getByTestId("run-button"));

    expect(screen.getByTestId("error-message")).toHaveTextContent(message);
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
    expect(screen.getByTestId("output")).toHaveValue("");
  });

  it("should not show any message before running", () => {
    expect(screen.queryByTestId("success-message")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });
});
