import { createSignal, createEffect, createMemo, createComputed } from '../src/signal.js';
import { mount } from '../src/index.js';

const Counter = () => {
  const [count, setCount] = createSignal(0);
  const [firstName, setFirstName] = createSignal("John");
  const [lastName, setLastName] = createSignal("Doe");
  
  // Read-only computed property
  const fullName = createComputed(() => {
    return `${firstName()} ${lastName()}`;
  });

  // Read-write computed property
  const [displayName, setDisplayName] = createComputed({
    get: () => `${fullName()} (Count: ${count()})`,
    set: (newValue) => {
      const [first, last] = newValue.split(' ');
      setFirstName(first);
      setLastName(last || '');
    }
  });

  // Memoized expensive computation
  const fibonacci = createMemo(() => {
    const fib = (n) => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    return fib(count());
  });

  // Double count using effect
  const [doubleCount, setDoubleCount] = createSignal(0);
  createEffect(() => {
    setDoubleCount(count() * 2);
  });

  return (
    <div>
      <h1>Counter Example with Computed</h1>
      <p>Count: {count}</p>
      <p>Double Count: {doubleCount}</p>
      <p>Fibonacci of Count: {fibonacci}</p>
      <p>Full Name: {fullName}</p>
      <p>Display Name: {displayName}</p>
      <div>
        <input 
          value={firstName()}
          onInput={(e) => setFirstName(e.target.value)}
          style={{ margin: '8px' }}
        />
        <input 
          value={lastName()}
          onInput={(e) => setLastName(e.target.value)}
          style={{ margin: '8px' }}
        />
      </div>
      <div>
        <button
          onClick={() => setDisplayName('Jane Smith')}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            margin: '8px'
          }}
        >
          Change to Jane Smith
        </button>
      </div>
      <div>
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
    </div>
  );
};

// Mount the app
const app = document.getElementById('app');
mount(Counter, app);