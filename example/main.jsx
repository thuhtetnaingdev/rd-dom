import { createSignal, createEffect, createMemo } from "../src/signal.js";
import { mount, atom, useAtom } from "../src/index.js";
import { ColorSwitcher, colorAtom } from "./ColorSwitcher.jsx";

const Counter = () => {
  const [count, setCount] = createSignal(0);
  const [color] = useAtom(colorAtom);

  // Expensive computation that we want to memoize
  const fibonacci = createMemo(() => {
    const fib = (n) => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    return fib(count());
  });

  // Double count computed with effect
  const [doubleCount, setDoubleCount] = createSignal(0);
  createEffect(() => {
    setDoubleCount(count() * 2);
  });

  // Style functions that return fresh objects with signal values
  const textStyle = createMemo(() => ({
    color: color(),
    transition: "color 0.3s",
    fontSize: "18px",
    margin: "8px 0",
  }));

  const buttonStyle = createMemo(() => ({
    padding: "8px 16px",
    fontSize: "16px",
    margin: "8px",
    backgroundColor: color(),
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s",
    borderRadius: "4px",
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h1
        style={() => ({
          ...textStyle(),
          fontSize: "28px",
          marginBottom: "20px",
        })}
      >
        Counter Example with Color
      </h1>
      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <p style={textStyle}>Count: {count}</p>
          <p style={textStyle}>Double Count: {doubleCount}</p>
          <p style={textStyle}>Fibonacci of Count: {fibonacci}</p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setCount((prev) => prev + 1)}
              style={buttonStyle}
            >
              Increment
            </button>
            <button
              onClick={() => setCount((prev) => prev - 1)}
              style={buttonStyle}
            >
              Decrement
            </button>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <ColorSwitcher />
        </div>
      </div>
    </div>
  );
};

// Mount the app
const app = document.getElementById("app");
mount(Counter, app);
