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

// Create a memoized value
export function createMemo(fn) {
  const [value, setValue] = createSignal(undefined);

  // Set up effect to recompute value when dependencies change
  createEffect(() => {
    const newValue = fn();
    setValue(newValue);
  });

  // Return read-only signal
  const memo = () => value();
  memo.isSignal = true;
  return memo;
}

// Create a computed property (like Vue's computed)
export function createComputed(optionsOrFn) {
  const [value, setValue] = createSignal(undefined);

  // Handle options object with getter/setter
  if (typeof optionsOrFn === "object") {
    const { get, set } = optionsOrFn;

    // Set up effect to recompute value when dependencies change
    createEffect(() => {
      const newValue = get();
      setValue(newValue);
    });

    // Return readable/writable signal
    const computed = () => value();
    computed.isSignal = true;

    if (set) {
      return [
        computed,
        (newValue) => {
          set(newValue);
        },
      ];
    }

    return computed;
  }

  // Handle function (getter only)
  createEffect(() => {
    const newValue = optionsOrFn();
    setValue(newValue);
  });

  // Return read-only signal
  const computed = () => value();
  computed.isSignal = true;
  return computed;
}
