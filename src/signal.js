// Track current observer function
let currentObserver = null;

class Signal {
  constructor(initialValue) {
    this._value = initialValue;
    this._observers = new Set();
    this._fn = () => this.value;
    this._fn.isSignal = true;
  }

  get value() {
    // Track dependency if there is an observer
    if (currentObserver) {
      this._observers.add(currentObserver);
    }
    return this._value;
  }

  set value(newValue) {
    if (this._value === newValue) return;
    this._value = newValue;
    // Notify observers
    queueMicrotask(() => {
      this._observers.forEach((observer) => observer());
    });
  }
}

// Create a new signal
export function createSignal(initialValue) {
  const signal = new Signal(initialValue);

  // Return tuple of getter and setter
  const read = signal._fn;
  const write = (newValue) => {
    signal.value =
      typeof newValue === "function" ? newValue(signal.value) : newValue;
  };

  return [read, write];
}

// Create an effect that tracks dependencies
export function createEffect(fn) {
  const execute = () => {
    currentObserver = execute;
    fn();
    currentObserver = null;
  };

  execute();
}
