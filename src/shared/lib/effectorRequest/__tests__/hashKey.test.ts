import { describe, it, expect } from "vitest";

import { hashKey } from "../hashKey";

describe("hashKey", () => {
  it("should hash primitives correctly", () => {
    expect(hashKey(["test"])).toEqual(JSON.stringify(["test"]));
    expect(hashKey([123])).toEqual(JSON.stringify([123]));
    expect(hashKey([null])).toEqual(JSON.stringify([null]));
  });

  it("should hash objects with sorted keys consistently", () => {
    const key1 = [{ b: 2, a: 1 }];
    const key2 = [{ a: 1, b: 2 }];

    const hash1 = hashKey(key1);
    const hash2 = hashKey(key2);

    expect(hash1).toEqual(hash2);
    expect(hash1).toEqual(JSON.stringify([{ a: 1, b: 2 }]));
  });

  it("should hash arrays consistently", () => {
    const arr1 = [{ b: 2, a: 1 }, "test", 123];
    const arr2 = [{ a: 1, b: 2 }, "test", 123];

    expect(hashKey(arr1)).toEqual(hashKey(arr2));
  });

  it("should handle nested objects with sorted keys", () => {
    const nested1 = [{ a: { d: 4, c: 3 }, b: 2 }];
    const nested2 = [{ b: 2, a: { c: 3, d: 4 } }];

    expect(hashKey(nested1)).toEqual(hashKey(nested2));
  });
});
