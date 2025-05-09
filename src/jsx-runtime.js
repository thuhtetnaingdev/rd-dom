import { createEffect, createSignal } from "./signal.js";

// Check if value is a signal or atom getter
const isSignal = (value) => {
  return (
    value &&
    typeof value === "function" &&
    (value.isSignal === true || value.toString().includes("atom"))
  );
};

// Handle reactive values (signals)
function resolveValue(value) {
  return isSignal(value) ? value() : value;
}

// Create text nodes for string/number values
function createTextNode(value) {
  if (value instanceof Text) {
    return value;
  }

  const node = document.createTextNode("");

  if (isSignal(value)) {
    createEffect(() => {
      const resolvedValue = value();
      node.textContent = resolvedValue instanceof Text 
        ? resolvedValue.textContent 
        : String(resolvedValue ?? "");
    });
  } else {
    node.textContent = String(value ?? "");
  }

  return node;
}

// Handle style object with potential signal values
function handleStyles(element, styles) {
  if (!styles) return;

  Object.entries(styles).forEach(([key, value]) => {
    if (isSignal(value)) {
      createEffect(() => {
        element.style[key] = value();
      });
    } else if (typeof value === "object" && !Array.isArray(value)) {
      // Handle nested style objects
      handleStyles(element, value);
    } else {
      element.style[key] = value;
    }
  });
}

// Handle props/attributes
function setProps(element, props) {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    if (key === "ref" && typeof value === "function") {
      value(element);
      continue;
    }

    if (key === "style") {
      if (isSignal(value)) {
        // Handle style object that is itself a signal
        createEffect(() => {
          handleStyles(element, resolveValue(value));
        });
      } else {
        handleStyles(element, value);
      }
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
          element.setAttribute("class", resolveValue(value));
        });
      } else {
        element.setAttribute("class", value);
      }
      continue;
    }

    // Handle regular attributes
    if (isSignal(value)) {
      createEffect(() => {
        const val = resolveValue(value);
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
    return result;
  }

  const element = document.createElement(type);
  setProps(element, props);

  // Flatten children and handle arrays
  const flattenChildren = (children) => {
    return children.reduce((flat, child) => {
      if (Array.isArray(child)) {
        flat.push(...flattenChildren(child));
      } else if (child != null && child !== false && child !== true) {
        flat.push(child);
      }
      return flat;
    }, []);
  };

  const flatChildren = flattenChildren(children);

  // Append children
  flatChildren.forEach(child => {
    if (child instanceof Node) {
      element.appendChild(child);
    } else if (isSignal(child)) {
      let placeholders = [];
      
      createEffect(() => {
        // Get current value
        const value = child();
        
        // Remove all previous placeholders
        placeholders.forEach(placeholder => {
          if (placeholder.parentNode === element) {
            element.removeChild(placeholder);
          }
        });
        placeholders = [];
        
        // Handle the new value
        if (Array.isArray(value)) {
          value.forEach(item => {
            const node = item instanceof Node 
              ? item 
              : document.createTextNode(String(item));
            element.appendChild(node);
            placeholders.push(node);
          });
        } else if (value instanceof Node) {
          element.appendChild(value);
          placeholders.push(value);
        } else if (value != null) {
          const textNode = document.createTextNode(String(value));
          element.appendChild(textNode);
          placeholders.push(textNode);
        }
      });
    } else {
      element.appendChild(createTextNode(child));
    }
  });

  return element;
}

// Create JSX fragment
export function Fragment(props) {
  const fragment = document.createDocumentFragment();

  if (props && props.children) {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children];
    children.forEach((child) => {
      if (child != null) {
        if (child instanceof Node) {
          fragment.appendChild(child);
        } else {
          fragment.appendChild(createTextNode(child));
        }
      }
    });
  }

  return fragment;
}

// For component implementation
export function For(props) {
  const renderFn = typeof props.children === 'function'
    ? props.children
    : Array.isArray(props.children) && typeof props.children[0] === 'function'
      ? props.children[0]
      : (item) => String(item);

  // Create a signal that returns an array of DOM nodes
  const [nodes, setNodes] = createSignal([]);
  
  // Set up reactivity
  createEffect(() => {
    const items = resolveValue(props.each) || [];
    
    if (items.length === 0 && props.fallback) {
      setNodes([props.fallback instanceof Node 
        ? props.fallback 
        : document.createTextNode(String(props.fallback))]);
      return;
    }
    
    const renderedNodes = items.map((item, index) => {
      try {
        const result = renderFn(item, index);
        return result instanceof Node 
          ? result 
          : document.createTextNode(String(result));
      } catch (error) {
        console.error("Error in For component:", error);
        const errorNode = document.createElement('div');
        errorNode.style.color = 'red';
        errorNode.textContent = `Error: ${error.message}`;
        return errorNode;
      }
    });
    
    setNodes(renderedNodes);
  });
  
  // Return the signal
  return nodes;
}

// Show component implementation
export function Show(props) {
  const condition = props.when;
  const renderContent = typeof props.children === 'function' 
    ? props.children 
    : () => props.children;
  const renderFallback = props.fallback 
    ? (typeof props.fallback === 'function' ? props.fallback : () => props.fallback)
    : () => null;
    
  const [content, setContent] = createSignal(null);
  
  createEffect(() => {
    const showContent = resolveValue(condition);
    
    if (showContent) {
      const rendered = renderContent(showContent);
      setContent(rendered instanceof Node 
        ? rendered 
        : document.createTextNode(String(rendered)));
    } else {
      const fallback = renderFallback();
      setContent(fallback instanceof Node 
        ? fallback 
        : fallback ? document.createTextNode(String(fallback)) : null);
    }
  });
  
  return content;
}

// JSX Factory functions
export { createElement as jsx };
export { createElement as jsxs };
export { createElement as jsxDEV };