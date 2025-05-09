import { createEffect } from "./signal.js";

// Helper to resolve signal values
function resolveValue(value) {
  return typeof value === "function" ? value() : value;
}

// Helper to create text node
function createTextNode(value) {
  return document.createTextNode(String(value ?? ""));
}

// Simplified For component that works more reliably with JSX
export function createForRenderer(items, renderFn, fallback) {
  // Create a container element
  const container = document.createElement("div");
  
  // Function to update the container's contents
  const updateContents = () => {
    // Clear the container first
    container.innerHTML = "";
    
    // Get the current items
    const currentItems = resolveValue(items);
    
    // If no items, show fallback if provided
    if (!currentItems || currentItems.length === 0) {
      if (fallback) {
        if (fallback instanceof Node) {
          container.appendChild(fallback);
        } else if (typeof fallback === "string" || typeof fallback === "number") {
          container.appendChild(createTextNode(fallback));
        }
      }
      return;
    }
    
    // Render each item
    currentItems.forEach((item, index) => {
      try {
        const renderedItem = renderFn(item, index);
        if (renderedItem instanceof Node) {
          container.appendChild(renderedItem);
        } else if (renderedItem != null) {
          container.appendChild(createTextNode(renderedItem));
        }
      } catch (error) {
        console.error("Error rendering item:", error);
        container.appendChild(createTextNode(`[Error: ${error.message}]`));
      }
    });
  };
  
  // Set up the effect to update the container when items change
  createEffect(updateContents);
  
  // Return the container
  return container;
}

// For component that can be used in JSX
export function For(props) {
  const { each, fallback } = props;
  
  // Extract the render function from children
  let renderFn;
  if (typeof props.children === "function") {
    renderFn = props.children;
  } else if (Array.isArray(props.children) && typeof props.children[0] === "function") {
    renderFn = props.children[0];
  } else {
    renderFn = (item) => createTextNode(String(item));
  }
  
  // Create and return the renderer
  return createForRenderer(each, renderFn, fallback);
}

// A more direct wrapper component for lists
export function ForList(props) {
  const container = document.createElement(props.as || "div");
  
  // Add any class name
  if (props.className) {
    container.className = props.className;
  }
  
  // Get the renderer
  const renderer = createForRenderer(
    props.each,
    props.children,
    props.fallback
  );
  
  // Set the renderer's style to contents to avoid extra div
  renderer.style.display = "contents";
  
  // Append the renderer
  container.appendChild(renderer);
  
  return container;
}