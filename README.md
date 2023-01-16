# 🌍 🐓 coq-of-js
> Import JavaScript programs to Coq. Prove all the things! 🐓

[![travis status](https://img.shields.io/travis/com/formal-land/coq-of-js/master.svg?label=travis-ci&style=flat-square)](https://travis-ci.org/formal-land/coq-of-js)
[![codecov status](https://img.shields.io/codecov/c/github/formal-land/coq-of-js.svg?style=flat-square)](https://codecov.io/gh/formal-land/coq-of-js)

**Online demo: https://formal-land.github.io/coq-of-js/**

The aim of this project is to import JavaScript programs to the [Coq](https://coq.inria.fr/) language, to do [formal verification](https://en.wikipedia.org/wiki/Formal_verification) on JavaScript code.

**Still under heavy development**

## Run
For now: a web-interface to do development, with four columns:
* the JavaScript input;
* the Coq output;
* the JavaScript AST;
* the Coq AST.

From the command line:
```
npm install
npm start
```
or with [Yarn](https://yarnpkg.com/lang/en/):
```
yarn install
yarn start
```

## Examples
See the [online demo](https://formal-land.github.io/coq-of-js/).

## Todo
We want to validate the basis:
* have a good project settings (tests, error handling, ...);
* import a reasonable volume of syntax;
* handle modules;
* handle a definition of side-effects;
* handle records vs maps, sum types, avoiding problems of structural typing vs nominal typing.

## Related work
TODO: read all the links!
* https://blog.acolyer.org/2018/01/19/javert-javascript-verification-toolchain/
* https://coq-club.inria.narkive.com/OzUzWkqV/is-there-a-minimal-subset-of-javascript-both-useful-for-formal-verification-and-practical-enough
* https://vtss.doc.ic.ac.uk/2018/03/19/formal-methods-meets-js.html
* https://vtss.doc.ic.ac.uk/slides/ECMA_JaVerT.pdf
* https://vtss.doc.ic.ac.uk/slides/From_JSCert_to_JSExplain_and_beyond.pdf
* http://spiral.imperial.ac.uk/bitstream/10044/1/55840/6/Fragoso2017Towards.pdf
* https://www.jswebtools.org/
* https://vtss.doc.ic.ac.uk/research/javascript.html
* https://www.doc.ic.ac.uk/~pg/publications/FragosoSantos2019JaVerT.pdf
