// @flow
import {compileAndPrint} from "../index.js";

describe("arrays", () => {
  it("handles arrays", () => {
    expect(compileAndPrint(`const a = [12];`)).toMatchSnapshot();
  });

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

describe("arrow functions", () => {
  it("handles arrow functions", () => {
    expect(compileAndPrint(`const f = x => x;`)).toMatchSnapshot();
  });

  it("handles type annotations", () => {
    expect(compileAndPrint(`const f = <A>(x: A): A => x;`)).toMatchSnapshot();
  });

  it("requires function parameters to be simple names", () => {
    expect(compileAndPrint(`const f = ({a}) => {};`)).toMatchSnapshot();
  });
});

describe("binary expressions", () => {
  it("handles binary expressions", () => {
    expect(compileAndPrint(`const n = 1 + 1;`)).toMatchSnapshot();
  });
});

describe("function calls", () => {
  it("handles function calls", () => {
    expect(compileAndPrint(`const y = f(x);`)).toMatchSnapshot();
  });

  it("does not handle spread parameters", () => {
    expect(compileAndPrint(`const n = f(...a);`)).toMatchSnapshot();
  });
});

describe("ternary expressions", () => {
  it("handles ternary expressions", () => {
    expect(compileAndPrint(`const n = true ? 12 : 0;`)).toMatchSnapshot();
  });
});

describe("functions", () => {
  it("handles functions in expressions", () => {
    expect(
      compileAndPrint(`const f = function (x) {return x};`),
    ).toMatchSnapshot();
  });
});

describe("logical expressions", () => {
  it("handles logical expressions", () => {
    expect(compileAndPrint(`const b = true && false;`)).toMatchSnapshot();
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

  it("does not handle enums with an inlined type annotation", () => {
    expect(
      compileAndPrint(`const e = ("Green": "Green" | "Blue");`),
    ).toMatchSnapshot();
  });
});

describe("type casts", () => {
  it("handles type casts", () => {
    expect(compileAndPrint(`const b = (true: boolean);`)).toMatchSnapshot();
  });
});

describe("unary expressions", () => {
  it("handles unary expressions", () => {
    expect(compileAndPrint(`const n = +0;`)).toMatchSnapshot();
  });
});
