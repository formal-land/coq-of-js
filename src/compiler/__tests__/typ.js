// @flow
import {compileAndPrint} from "../index.js";

describe("unhandled types", () => {
  it("shows an error message on unhandled types", () => {
    expect(compileAndPrint(`const a: number | string = 12;`))
      .toMatchInlineSnapshot(`
      "> 1 | const a: number | string = 12;
          |         ^^^^^^^^^^^^^^^

      Unhandled syntax:
      {
        \\"type\\": \\"UnionTypeAnnotation\\",
        \\"start\\": 9,
        \\"end\\": 24,
        \\"loc\\": {
          \\"start\\": {
            \\"line\\": 1,
            \\"column\\": 9
          },
          \\"end\\": {
            \\"line\\": 1,
            \\"column\\": 24
          }
        },
        \\"types\\": [
          {
            \\"type\\": \\"NumberTypeAnnotation\\",
            \\"start\\": 9,
            \\"end\\": 15,
            \\"loc\\": {
              \\"start\\": {
                \\"line\\": 1,
                \\"column\\": 9
              },
              \\"end\\": {
                \\"line\\": 1,
                \\"column\\": 15
              }
            }
          },
          {
            \\"type\\": \\"StringTypeAnnotation\\",
            \\"start\\": 18,
            \\"end\\": 24,
            \\"loc\\": {
              \\"start\\": {
                \\"line\\": 1,
                \\"column\\": 18
              },
              \\"end\\": {
                \\"line\\": 1,
                \\"column\\": 24
              }
            }
          }
        ]
      }"
    `);
  });
});
