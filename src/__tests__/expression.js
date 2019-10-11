// @flow
import {compileAndPrint} from "../compiler/index.js";

it("requires function parameters to be simple names", () => {
  expect(compileAndPrint(`function foo({a}) {return a;}`)).toMatchSnapshot();
});

it("handles empty arrays", () => {
  expect(compileAndPrint(`const a = [];`)).toMatchSnapshot();
});

it("does not handle empty elements in arrays", () => {
  expect(compileAndPrint(`const a = [,];`)).toMatchSnapshot();
});

it("does not handle spreads in arrays", () => {
  expect(compileAndPrint(`const a = [...[]];`)).toMatchSnapshot();
});

it("does not handle calls with spread parameters", () => {
  expect(compileAndPrint(`const n = f(...a);`)).toMatchSnapshot();
});

it("handles nulls", () => {
  expect(compileAndPrint(`const n = null;`)).toMatchSnapshot();
});

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

it("expects `type` fields to be literal strings", () => {
  expect(compileAndPrint(`const o = ({type: 12}: Status);`)).toMatchSnapshot();
});

it("handles enum instances", () => {
  expect(compileAndPrint(`const e = ("Green": Kind);`)).toMatchSnapshot();
});
