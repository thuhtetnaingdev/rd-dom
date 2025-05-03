import { createEffect } from "./signal.js";

// Check if value is a signal
const isSignal = (value) => {
  return value && typeof value === "function" && value.isSignal === true;
};

// Handle reactive values (signals)
function resolveValue(value) {
  return isSignal(value) ? value() : value;
}

// Create text nodes for string/number values
function createTextNode(value) {
  const node = document.createTextNode("");

  if (isSignal(value)) {
    // Use createEffect to automatically track and update the text content
    createEffect(() => {
      node.textContent = String(value());
    });
  } else {
    node.textContent = String(value);
  }

  return node;
}

// Handle props/attributes
function setProps(element, props) {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    if (key === "ref" && typeof value === "function") {
      value(element);
      continue;
    }

    if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
      continue;
    }

    if (key.startsWith("on") && key.toLowerCase() in window) {
      const eventName = key.toLowerCase().slice(2);
      element.addEventListener(eventName, value);
      continue;
    }

    // Handle className
    if (key === "className") {
      if (isSignal(value)) {
        createEffect(() => {
          element.setAttribute("class", value());
        });
      } else {
        element.setAttribute("class", value);
      }
      continue;
    }

    // Handle regular attributes
    if (isSignal(value)) {
      createEffect(() => {
        const val = value();
        if (typeof val === "boolean") {
          if (val) {
            element.setAttribute(key, "");
          } else {
            element.removeAttribute(key);
          }
        } else {
          element.setAttribute(key, val);
        }
      });
    } else if (typeof value === "boolean") {
      if (value) {
        element.setAttribute(key, "");
      } else {
        element.removeAttribute(key);
      }
    } else {
      element.setAttribute(key, value);
    }
  }
}

// Create DOM elements
export function createElement(type, props, ...children) {
  // Handle function components
  if (typeof type === "function") {
    const result = type(props || {});
    if (typeof result === "function") {
      return result();
    }
    return result;
  }

  const element = document.createElement(type);
  setProps(element, props);

  // Flatten children and handle arrays
  const flattenChildren = (children) => {
    return children.reduce((flat, child) => {
      if (Array.isArray(child)) {
        flat.push(...flattenChildren(child));
      } else if (child != null && child !== false) {
        flat.push(child);
      }
      return flat;
    }, []);
  };

  const flatChildren = flattenChildren(children);

  // Append children
  for (const child of flatChildren) {
    const node = typeof child === "object" ? child : createTextNode(child);

    element.appendChild(node);
  }

  return element;
}

// Create JSX fragment
export function Fragment({ children }) {
  const fragment = document.createDocumentFragment();

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (child != null) {
        fragment.appendChild(
          typeof child === "object" ? child : createTextNode(child)
        );
      }
    });
  }

  return fragment;
}

// JSX Factory functions
export const jsx = createElement;
export const jsxs = createElement;
export const jsxDEV = createElement;
