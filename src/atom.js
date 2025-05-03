import { createSignal, createEffect } from "./signal.js";

// Store to keep track of all atoms
const atomStore = new Map();

// Create a primitive atom
export function atom(initialValue) {
  // Create a unique key for the atom
  const key = Symbol();

  // Create the underlying signal
  const [value, setValue] = createSignal(initialValue);

  // Create the atom object
  const atomObject = {
    key,
    read: value,
    write: setValue,
    type: "primitive",
  };

  // Store the atom
  atomStore.set(key, atomObject);

  return atomObject;
}

// Create a derived atom (read-only)
export function derivedAtom(deps, fn) {
  const key = Symbol();
  const [value, setValue] = createSignal(undefined);

  // Set up the computation
  createEffect(() => {
    const depValues = deps.map((dep) => dep.read());
    const newValue = fn(...depValues);
    setValue(newValue);
  });

  const atomObject = {
    key,
    read: value,
    type: "derived",
  };

  atomStore.set(key, atomObject);

  return atomObject;
}

// Create a writable derived atom
export function writableAtom(deps, read, write) {
  const key = Symbol();
  const [value, setValue] = createSignal(undefined);

  // Set up the read computation
  createEffect(() => {
    const depValues = deps.map((dep) => dep.read());
    const newValue = read(...depValues);
    setValue(newValue);
  });

  const atomObject = {
    key,
    read: value,
    write: (...args) => {
      const depValues = deps.map((dep) => dep.read());
      write(...args, ...depValues);
    },
    type: "writableDerived",
  };

  atomStore.set(key, atomObject);

  return atomObject;
}

// Hook to use an atom value
export function useAtom(atom) {
  if (atom.type === "primitive" || atom.type === "writableDerived") {
    return [atom.read, atom.write];
  }
  return atom.read;
}

// Create an async atom
export function asyncAtom(asyncFn) {
  const key = Symbol();
  const [value, setValue] = createSignal({
    loading: true,
    data: null,
    error: null,
  });

  // Start the async computation
  Promise.resolve(asyncFn())
    .then((data) => setValue({ loading: false, data, error: null }))
    .catch((error) => setValue({ loading: false, data: null, error }));

  const atomObject = {
    key,
    read: value,
    type: "async",
  };

  atomStore.set(key, atomObject);

  return atomObject;
}

// Reset all atoms to their initial values
export function resetAtoms() {
  atomStore.forEach((atom) => {
    if (atom.type === "primitive" && atom.write) {
      atom.write(atom.initialValue);
    }
  });
}
