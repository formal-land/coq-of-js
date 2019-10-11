// @flow
import {compileAndPrint} from "../compiler/index.js";

describe("empty statements", () => {
  it("handles empty statements", () => {
    expect(compileAndPrint(`function foo() {}`)).toMatchSnapshot();
  });
});

describe("returns", () => {
  it("handles returns", () => {
    expect(compileAndPrint(`function foo() {return 12;}`)).toMatchSnapshot();
  });

  it("handles empty returns", () => {
    expect(compileAndPrint(`function foo() {return;}`)).toMatchSnapshot();
  });
});

describe("destructuring of enums", () => {
  it("handles destructuring of enums", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch ((s: Status)) {
    case "OK":
      return true;
    case "Error":
      return false;
  }
}
`),
    ).toMatchSnapshot();
  });

  it("does not handle default cases", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch ((s: Status)) {
    default:
      return true;
  }
}
`),
    ).toMatchSnapshot();
  });

  it("expects a type annotation on the discriminant", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s) {
    case "OK":
      return true;
    case "Error":
      return false;
  }
}
`),
    ).toMatchSnapshot();
  });
});

describe("definition of variables", () => {
  it("handles definitions of variables", () => {
    expect(compileAndPrint(`function foo() {const x = 12;}`)).toMatchSnapshot();
  });

  it("does not handle simultaneous definitions", () => {
    expect(
      compileAndPrint(`function foo() {const x = 12, b = false;}`),
    ).toMatchSnapshot();
  });

  it("does not handle empty definitions", () => {
    expect(compileAndPrint(`function foo() {var x;}`)).toMatchSnapshot();
  });
});

describe("destructuring of records by definition of variables", () => {
  it("handles destructuring of records", () => {
    expect(
      compileAndPrint(`function foo() {const {a, b}: Rec = o;}`),
    ).toMatchSnapshot();
  });

  it("requires a type annotation", () => {
    expect(
      compileAndPrint(`function foo() {const {a, b} = o;}`),
    ).toMatchSnapshot();
  });

  it("requires strings for the field names", () => {
    expect(
      compileAndPrint(`function foo() {const {["a" + "b"]: v}: Rec = o;}`),
    ).toMatchSnapshot();
  });

  it("requires identifiers for the field values", () => {
    expect(
      compileAndPrint(`function foo() {const {a: {v}}: Rec = o;}`),
    ).toMatchSnapshot();
  });

  it("does not recognize spread patterns", () => {
    expect(
      compileAndPrint(`function foo() {const {...a}: Rec = o;}`),
    ).toMatchSnapshot();
  });
});
