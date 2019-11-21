// @flow

export default `/* Basic definitions */

const
  b: boolean = false && true,
  n: number = -12 + 23;

const s = "hi";

const a = [1, (2 : number), 3];

const cond = b ? "a" : 'b';

/* Functions */

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

/* Records */

type Rec = {
  a: string,
  b: number,
  c: boolean
};

const o = ({a: "hi", b: 12, c: false}: Rec);

const hi = (o: Rec).a;

const getHi = (o: Rec) => {
  const {a: hi}: Rec = o;
  return hi;
};

/* Enums */

type Enum = "aa" | "bb" | "gg";

const aa = ("aa": Enum);

function getEnumIndex(e: Enum): number {
  switch ((e: Enum)) {
    case "aa":
      return 0;
    case "bb":
      return 1;
    default:
      return 2;
  }
}

/* Algebraic data types */

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

function getMessage(status: Status): string {
  switch ((status: Status).type) {
    case "Error": {
      const {message} = status;
      return message;
    }
    case "Loading":
      return "loading...";
    case "Nothing":
      return "";
    default:
      return (status: empty);
  }
}
`;
