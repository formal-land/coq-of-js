// @flow
import {compileAndPrint} from "../index.js";

describe("function definitions", () => {
  it("requires function parameters to be simple names", () => {
    expect(compileAndPrint(`function foo({a}) {return a;}`)).toMatchSnapshot();
  });
});

describe("arrays", () => {
  it("handles empty arrays", () => {
    expect(compileAndPrint(`const a = [];`)).toMatchSnapshot();
  });

  it("does not handle empty elements", () => {
    expect(compileAndPrint(`const a = [,];`)).toMatchSnapshot();
  });

  it("does not handle spreads", () => {
    expect(compileAndPrint(`const a = [...[]];`)).toMatchSnapshot();
  });
});

describe("function calls", () => {
  it("does not handle spread parameters", () => {
    expect(compileAndPrint(`const n = f(...a);`)).toMatchSnapshot();
  });
});

describe("nulls", () => {
  it("handles nulls", () => {
    expect(compileAndPrint(`const n = null;`)).toMatchSnapshot();
  });
});

describe("objects as records", () => {
  it("handles empty objects", () => {
    expect(compileAndPrint(`const o = {};`)).toMatchSnapshot();
  });

  it("does not handle non-empty objects without annotations", () => {
    expect(compileAndPrint(`const o = {x: 12};`)).toMatchSnapshot();
  });

  it("handles record instances", () => {
    expect(
      compileAndPrint(`const o = ({a: "hi", "b": 12}: Rec);`),
    ).toMatchSnapshot();
  });

  it("does not handle records with methods", () => {
    expect(compileAndPrint(`const o = ({foo() {}}: Rec);`)).toMatchSnapshot();
  });

  it("does not handle records with spreads", () => {
    expect(compileAndPrint(`const o = ({...rec}: Rec);`)).toMatchSnapshot();
  });

  it("does not handle records with computed property names", () => {
    expect(compileAndPrint(`const o = ({[a]: "hi"}: Rec);`)).toMatchSnapshot();
  });

  it("does not handle records with numeric names", () => {
    expect(compileAndPrint(`const o = ({12: "hi"}: Rec);`)).toMatchSnapshot();
  });
});

describe("objects as sum types", () => {
  it("handles sum types", () => {
    expect(
      compileAndPrint(`const o = ({type: "Foo", a: 12}: Status);`),
    ).toMatchSnapshot();
  });

  it("handles sum types without parameters", () => {
    expect(
      compileAndPrint(`const o = ({type: "Foo"}: Status);`),
    ).toMatchSnapshot();
  });

  it("expects the `type` field to be a literal strings", () => {
    expect(
      compileAndPrint(`const o = ({type: 12}: Status);`),
    ).toMatchSnapshot();
  });
});

describe("enums", () => {
  it("handles enums", () => {
    expect(compileAndPrint(`const e = ("Green": Kind);`)).toMatchSnapshot();
  });
});
