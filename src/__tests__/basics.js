// @flow
import {compileAndPrint} from "../compiler/index.js";

it("handles basics", () => {
  expect(
    compileAndPrint(
      `// Some examples

const
  b: boolean = false && true,
  n: number = -12 + 23;

const s = "hi";

const a = [1, (2 : number), 3];

const cond = b ? "a" : 'b';

function id<A, B>(x: A): A {
  return x;
}

function basicTypes(n: number, m: number): string {
  return "OK";
}

const r = id(basicTypes(12, 23));

const f = function<A> (x : A, y : A): bool {
  return true;
}

const arrow = x => x + 1;
`,
      40,
    ),
  ).toMatchSnapshot();
});
