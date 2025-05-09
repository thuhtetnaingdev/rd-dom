import { createEffect } from "./signal.js";

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
  const node = document.createTextNode("");

  if (isSignal(value)) {
    createEffect(() => {
      node.textContent = String(value());
    });
  } else {
    node.textContent = String(value);
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
    return type(props || {});
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
  for (const child of flatChildren) {
    if (child instanceof Node) {
      element.appendChild(child);
    } else {
      element.appendChild(createTextNode(child));
    }
  }

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

// For component for list rendering (similar to SolidJS)
export function For(props) {
  // Create container element that will stay in the DOM
  const container = document.createElement('div');
  container.style.display = 'contents'; // Make it not affect layout
  
  // Extract the render function from props
  const renderFn = typeof props.children === 'function' 
    ? props.children 
    : Array.isArray(props.children) && typeof props.children[0] === 'function'
      ? props.children[0]
      : (item) => createTextNode(String(item));
  
  // Store rendered items by key to update efficiently
  const renderedItems = new Map();
  
  createEffect(() => {
    // Get the current items array
    const items = resolveValue(props.each) || [];
    
    // Show fallback if no items
    if (items.length === 0) {
      // Clear existing content
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Add fallback if provided
      if (props.fallback) {
        container.appendChild(props.fallback);
      }
      return;
    }
    
    // Track keys that are in the current array
    const currentKeys = new Set();
    
    // Track child elements in their correct positions
    const childElements = [];
    
    // Process each item
    items.forEach((item, index) => {
      // Use id as key if available, otherwise use index
      const key = item && item.id !== undefined ? item.id : index;
      currentKeys.add(key);
      
      // Create or update the rendered item
      if (!renderedItems.has(key)) {
        // Render a new item
        try {
          const rendered = renderFn(item, index);
          renderedItems.set(key, {
            node: rendered instanceof Node ? rendered : createTextNode(String(rendered)),
            item: item
          });
        } catch (error) {
          console.error('Error rendering item:', error);
          renderedItems.set(key, {
            node: createTextNode(`[Error rendering item: ${error.message}]`),
            item: item
          });
        }
      }
      
      // Get the rendered node
      const renderedItem = renderedItems.get(key);
      childElements.push(renderedItem.node);
    });
    
    // Remove items that are no longer in the array
    renderedItems.forEach((value, key) => {
      if (!currentKeys.has(key)) {
        renderedItems.delete(key);
      }
    });
    
    // Update the DOM - remove all children then add in correct order
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Add all elements in the correct order
    childElements.forEach(node => {
      container.appendChild(node);
    });
  });
  
  return container;
}

// Show component for conditional rendering
export function Show(props) {
  const container = document.createElement('div');
  container.style.display = 'contents'; // Make it not affect layout
  
  createEffect(() => {
    // Clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Get the condition
    const condition = resolveValue(props.when);
    
    if (condition) {
      // Show the content
      const content = typeof props.children === 'function' 
        ? props.children(condition) 
        : Array.isArray(props.children) && typeof props.children[0] === 'function'
          ? props.children[0](condition)
          : props.children;
          
      if (content instanceof Node) {
        container.appendChild(content);
      } else if (content != null) {
        container.appendChild(createTextNode(String(content)));
      }
    } else if (props.fallback) {
      // Show the fallback
      if (props.fallback instanceof Node) {
        container.appendChild(props.fallback);
      } else {
        container.appendChild(createTextNode(String(props.fallback)));
      }
    }
  });
  
  return container;
}

// JSX Factory functions
export { createElement as jsx };
export { createElement as jsxs };
export { createElement as jsxDEV };