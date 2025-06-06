export {
  createSignal,
  createEffect,
  createMemo,
  createComputed,
} from "./signal.js";
export { createElement, Fragment, jsx, jsxs, jsxDEV, Show, For } from "./jsx-runtime.js";
export {
  atom,
  derivedAtom,
  writableAtom,
  useAtom,
  asyncAtom,
  resetAtoms,
} from "./atom.js";

// Mount function to render components to DOM
export function mount(component, container) {
  if (typeof component !== "function") {
    throw new Error("First argument must be a function component");
  }

  if (!(container instanceof Node)) {
    throw new Error("Second argument must be a DOM node");
  }

  const result = component();
  if (!(result instanceof Node)) {
    throw new Error("Component must return a DOM node");
  }

  // Clear container before mounting
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  container.appendChild(result);
  return result;
}
