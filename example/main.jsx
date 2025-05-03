import { createElement } from '../src/jsx-runtime.js';
import { createSignal, createEffect } from '../src/signal.js';
import { mount } from '../src/index.js';

const Counter = () => {
  const [count, setCount] = createSignal(0);
  const [doubleCount, setDoubleCount] = createSignal(0);

  // Effect to update doubleCount when count changes
  createEffect(() => {
    setDoubleCount(count() * 2);
  });

  return createElement('div', null,
    createElement('h1', null, 'Counter Example'),
    createElement('p', null, 'Count: ', count), // Pass signal directly
    createElement('p', null, 'Double Count: ', doubleCount), // Pass signal directly
    createElement('button', {
      onClick: () => setCount(prev => prev + 1),
      style: {
        padding: '8px 16px',
        fontSize: '16px',
        margin: '8px'
      }
    }, 'Increment'),
    createElement('button', {
      onClick: () => setCount(prev => prev - 1),
      style: {
        padding: '8px 16px',
        fontSize: '16px',
        margin: '8px'
      }
    }, 'Decrement')
  );
};

// Mount the app
const app = document.getElementById('app');
mount(Counter, app);