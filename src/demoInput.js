// @flow

export default `// Basic definitions //

const
  b: boolean = false && true,
  n: number = -12 + 23;

const s = "hi";

const a = [1, (2 : number), 3];

const cond = b ? "a" : 'b';


// Functions //

function id<A>(x: A): A {
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


// Records //

type Rec = {
  a: string,
  b: number,
  c: boolean
};

const o = ({a: "hi", b: 12, c: false}: Rec);

const hi = (o: Rec).a;


// Sum types //

type Status =
  | {
      type: "Error",
      message: string,
    }
  | {
      type: "Loading",
    }
  | {
      type: "Nothing",
    };

const status: Status = ({type: "Error", message: "hi"}: Status);
`;
