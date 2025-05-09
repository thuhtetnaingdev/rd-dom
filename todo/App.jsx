import { createSignal, createEffect } from "../src/signal.js";
import { atom, useAtom, For } from "../src/index.js";

// Todo atom to store todos
const todoAtom = atom([
  { id: 1, text: "Learn RD-DOM", completed: false },
  { id: 2, text: "Build Todo App", completed: true },
]);

const TodoItem = ({ todo, onToggle, onDelete }) => (
  <li class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        class="w-5 h-5 accent-blue-500"
      />
      <span
        class={todo.completed ? "text-gray-400 line-through" : "text-gray-800"}
      >
        {todo.text}
      </span>
    </div>
    <button
      onClick={() => onDelete(todo.id)}
      class="text-red-500 hover:text-red-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    </button>
  </li>
);

const TodoList = ({ todos, onToggle, onDelete }) => {
  return (
    <ul class="space-y-3">
      <For 
        each={todos}
        fallback={<div class="text-gray-500 text-center">No todos yet. Add one above!</div>}
        children={(todo) => (
          <TodoItem 
            todo={todo} 
            onToggle={onToggle} 
            onDelete={onDelete} 
          />
        )}
      />
    </ul>
  );
};

export const App = () => {
  const [todos, setTodos] = useAtom(todoAtom);
  const [newTodo, setNewTodo] = createSignal("");

  const addTodo = (e) => {
    e.preventDefault();
    const text = newTodo().trim();
    if (!text) return;

    console.log("Adding todo:", text);
    setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Todo List
        </h1>

        <form onSubmit={addTodo} class="mb-6 flex gap-2">
          <input
            type="text"
            value={newTodo()}
            onInput={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </form>

        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </div>
  );
};