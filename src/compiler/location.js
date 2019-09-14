// @flow
import {codeFrameColumns} from "@babel/code-frame";

type Cursor = {
  column: number,
  line: number,
};

export type t = {
  end: Cursor,
  start: Cursor,
};

export function print(source: string, location: t): string {
  return codeFrameColumns(source, location);
}
