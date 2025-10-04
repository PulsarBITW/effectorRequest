/**
 * @Copyright
 *  https://github.com/TanStack/query
 *  https://github.com/TanStack/query/blob/main/packages/query-core/src/utils.ts
 */

/**
 * Default keys hash function.
 * Hashes the value into a stable hash.
 */
export function hashKey(queryKey: unknown): string {
  return JSON.stringify(queryKey, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key];
            return result;
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
          }, {} as any)
      : val
  );
}

function hasObjectPrototype(o: unknown): boolean {
  return Object.prototype.toString.call(o) === "[object Object]";
}

//eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
function isPlainObject(o: unknown): o is Object {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has no constructor
  const ctor = o?.constructor;
  if (ctor === undefined) {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  //eslint-disable-next-line no-prototype-builtins
  if (!prot.hasOwnProperty("isPrototypeOf")) {
    return false;
  }

  // Handles Objects created by Object.create(<arbitrary prototype>)
  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
