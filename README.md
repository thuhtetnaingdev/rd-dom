# RD-DOM: A React-like Library with Signal-based Reactivity

RD-DOM is a lightweight UI library that combines React-like JSX syntax with signal-based reactivity similar to SolidJS and atomic state management inspired by Jotai. This library is built for educational purposes to demonstrate how modern UI libraries work under the hood.

## Core Concepts

### 1. Signal System (`src/signal.js`)

The signal system provides reactive primitives for handling state:

```javascript
// Create a signal
const [count, setCount] = createSignal(0);

// Read value
console.log(count()); // 0

// Update value
setCount(1);
```

Key features:

- **createSignal**: Creates a reactive value with getter and setter
- **createEffect**: Runs side effects when dependencies change
- **createMemo**: Memoizes computed values
- **createComputed**: Vue-like computed properties with getters/setters

#### How Signals Work

1. Each signal maintains a list of observers (effects that depend on it)
2. When a signal's value changes, it notifies its observers
3. Effects automatically track signal dependencies when they run
4. Updates are batched using queueMicrotask for better performance

### 2. JSX Runtime (`src/jsx-runtime.js`)

Direct DOM manipulation without Virtual DOM:

```javascript
createElement(
  "div",
  { className: "container" },
  createElement("h1", null, "Hello"),
  createElement("p", null, count)
);
```

Features:

- Direct DOM node creation
- Signal integration in text nodes and attributes
- Event handling
- Style and attribute management
- Fragment support

#### How JSX Works

1. JSX is transformed to createElement calls
2. createElement creates real DOM nodes directly
3. Signals in JSX are automatically handled and updated
4. Event handlers and props are attached to DOM nodes

### 3. Atomic State Management (`src/atom.js`)

Jotai-inspired atomic state management:

```javascript
// Create atoms
const countAtom = atom(0);
const doubledAtom = derivedAtom([countAtom], (count) => count * 2);

// Use atoms
const [count, setCount] = useAtom(countAtom);
const doubled = useAtom(doubledAtom);
```

Features:

- **atom**: Creates primitive atoms for basic state
- **derivedAtom**: Creates read-only computed atoms
- **writableAtom**: Creates read-write computed atoms
- **asyncAtom**: Handles asynchronous state
- **Global state management**: Atoms are globally accessible

#### How Atoms Work

1. Atoms store their state using signals internally
2. Derived atoms automatically update when their dependencies change
3. Atoms are stored in a global Map for state management
4. Async atoms handle loading and error states

### 4. Component System

Components are just functions that return DOM nodes:

```javascript
const Counter = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
};
```

#### How Components Work

1. Components are plain functions
2. They can use signals, effects, and atoms
3. They return real DOM nodes
4. The mount function renders components to the DOM

## Project Structure

```
src/
├── signal.js     # Reactive primitives
├── jsx-runtime.js # JSX transformation and DOM handling
├── atom.js       # Atomic state management
└── index.js      # Main exports

example/
├── index.html    # Entry point
└── main.jsx      # Demo application
```

## Features

1. **Signal-based Reactivity**

   - Fine-grained updates
   - Automatic dependency tracking
   - Effect system for side effects
   - Memoization support

2. **Native DOM Operations**

   - No Virtual DOM overhead
   - Direct DOM manipulation
   - Efficient updates

3. **Atomic State Management**

   - Global state atoms
   - Derived state
   - Async state handling
   - State persistence

4. **Developer Experience**
   - JSX support
   - Familiar React-like API
   - Simple mental model
   - Small bundle size

## Performance Characteristics

1. **Efficient Updates**

   - No virtual DOM diffing
   - Direct DOM manipulation
   - Granular updates through signals
   - Automatic dependency tracking

2. **Memory Efficiency**

   - Minimal wrapper objects
   - No virtual DOM tree
   - Efficient signal-based subscriptions

3. **Bundle Size**
   - Small core library
   - No heavy reconciliation engine
   - Minimal runtime overhead

## Usage Example

```jsx
import { createSignal, atom, mount } from "rd-dom";

// Create atoms for global state
const countAtom = atom(0);
const nameAtom = atom("John");

function App() {
  const [count, setCount] = useAtom(countAtom);
  const [name] = useAtom(nameAtom);

  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}

mount(App, document.getElementById("app"));
```

## Educational Value

This library demonstrates several important concepts in modern UI development:

1. **Reactive Programming**

   - Signal-based reactivity
   - Dependency tracking
   - Effect systems

2. **DOM Manipulation**

   - Direct vs Virtual DOM
   - Event handling
   - Attribute management

3. **State Management**

   - Atomic state patterns
   - Derived state
   - Global state

4. **JavaScript Concepts**
   - Closures
   - Microtasks
   - Observer pattern

## Further Development

Possible areas for expansion:

1. Component lifecycle hooks
2. Error boundaries
3. Context API
4. Server-side rendering
5. Suspense and concurrent features

## License

MIT
