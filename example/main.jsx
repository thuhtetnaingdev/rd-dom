import { createSignal, createEffect } from '../src/signal.js';
import { mount } from '../src/index.js';

const Counter = () => {
  const [count, setCount] = createSignal(0);
  const [doubleCount, setDoubleCount] = createSignal(0);

  // Effect to update doubleCount when count changes
  createEffect(() => {
    setDoubleCount(count() * 2);
  });

  return (
    <div>
      <h1>Counter Example</h1>
      <p>Count: {count}</p>
      <p>Double Count: {doubleCount}</p>
      <button
        onClick={() => setCount(prev => prev + 1)}
        style={{
          padding: '8px 16px',
          fontSize: '16px',
          margin: '8px'
        }}
      >
        Increment
      </button>
      <button
        onClick={() => setCount(prev => prev - 1)}
        style={{
          padding: '8px 16px',
          fontSize: '16px',
          margin: '8px'
        }}
      >
        Decrement
      </button>
    </div>
  );
};

// Mount the app
const app = document.getElementById('app');
mount(Counter, app);