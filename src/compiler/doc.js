// @flow
// A wrapper around Prettier doc primitives.
import doc from "prettier/doc.js";

declare opaque type Doc;

export type t = Doc | string;

const {
  concat,
  group,
  hardline,
  indent,
  join,
  line,
  softline,
}: {
  concat: (docs: $ReadOnlyArray<t>) => t,
  group: (doc: t) => t,
  hardline: t,
  indent: (doc: t) => t,
  join: (sep: t, docs: $ReadOnlyArray<t>) => t,
  line: t,
  softline: t,
} = doc.builders;

export {concat, group, hardline, indent, join, line, softline};
