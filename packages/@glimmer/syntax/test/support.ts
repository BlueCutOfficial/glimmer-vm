import type { AST, PreprocessOptions } from '@glimmer/syntax';
import { preprocess as parse } from '@glimmer/syntax';
import { entries } from '@glimmer/util';

function normalizeNode(obj: AST.Node | Array<AST.Node>): AST.Node | Array<AST.Node> {
  return normalizeValue(obj);
}

function isLoc(key: string | number | symbol): boolean {
  return key === 'loc' || key === 'openTag' || key === 'closeTag';
}

function normalizeValue<T extends AST.Node | AST.Node[] | unknown>(obj: T): T {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(normalizeValue) as T;
    } else {
      return fromEntries(
        entries(obj).flatMap(([key, value]) => (isLoc(key) ? [] : [[key, normalizeValue(value)]]))
      ) as T;
    }
  } else {
    return obj;
  }
}

// convert entries ([string, unknown][]) into a record
type FromEntries<T extends [PropertyKey, unknown][]> = {
  [K in T[number] as K[0]]: Extract<K, [PropertyKey, unknown]>[1];
};

function fromEntries<T extends [PropertyKey, unknown][]>(entries: T): FromEntries<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = {};

  for (const [key, value] of entries) {
    out[key as string] = value;
  }

  return out as FromEntries<T>;
}

export function astEqual(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actual: any | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expected: any | null | undefined,
  message?: string,
  parseOptions?: PreprocessOptions
) {
  if (typeof actual === 'string') {
    actual = parse(actual, parseOptions);
  }
  if (typeof expected === 'string') {
    expected = parse(expected, parseOptions);
  }

  actual = normalizeNode(actual);
  expected = normalizeNode(expected);

  QUnit.assert.deepEqual(actual, expected, message);
}
