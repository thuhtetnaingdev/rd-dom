import { mount } from '../src/index.js';
import { atom, derivedAtom, writableAtom, useAtom } from '../src/atom.js';

// Create atoms for our state
const countAtom = atom(0);
const firstNameAtom = atom('John');
const lastNameAtom = atom('Doe');

// Create a derived atom for full name (read-only)
const fullNameAtom = derivedAtom(
  [firstNameAtom, lastNameAtom],
  (firstName, lastName) => `${firstName} ${lastName}`
);

// Create a derived atom for double count (read-only)
const doubleCountAtom = derivedAtom(
  [countAtom],
  (count) => count * 2
);

// Create a writable derived atom for display name
const displayNameAtom = writableAtom(
  [fullNameAtom, countAtom],
  // Read function
  (fullName, count) => `${fullName} (Count: ${count})`,
  // Write function
  (newValue) => {
    const [first, last] = newValue.split(' ');
    firstNameAtom.write(first);
    lastNameAtom.write(last || '');
  }
);

// Create a derived atom for fibonacci (with memoization built-in)
const fibonacciAtom = derivedAtom(
  [countAtom],
  (count) => {
    const fib = (n) => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };
    return fib(count);
  }
);

const Counter = () => {
  const [count, setCount] = useAtom(countAtom);
  const [firstName, setFirstName] = useAtom(firstNameAtom);
  const [lastName, setLastName] = useAtom(lastNameAtom);
  const fullName = useAtom(fullNameAtom);
  const [displayName, setDisplayName] = useAtom(displayNameAtom);
  const doubleCount = useAtom(doubleCountAtom);
  const fibonacci = useAtom(fibonacciAtom);

  return (
    <div>
      <h1>Counter Example with Atoms</h1>
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