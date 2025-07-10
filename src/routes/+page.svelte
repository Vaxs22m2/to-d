<script lang="ts">
  import { onMount } from 'svelte';
  import { db, type Todo } from '$lib/db';
  import { writable, derived, get } from 'svelte/store';
  import '../app.css';

  type Filter = 'all' | 'active' | 'completed';

  const todos = writable<Todo[]>([]);
  const newTodo = writable('');
  const filter = writable<Filter>('all');

  onMount(async () => {
    const allTodos = await db.todos.toArray();
    todos.set(allTodos);
  });

  async function handleAdd() {
    const $newTodo = get(newTodo).trim();
    if (!$newTodo) return;

    const newItem: Todo = {
      id: crypto.randomUUID(),
      text: $newTodo,
      completed: false,
    };

    await db.todos.add(newItem);
    todos.update(t => [newItem, ...t]);
    newTodo.set('');
  }

  async function handleToggle(id: string) {
    const allTodos = get(todos);
    const todo = allTodos.find(t => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    await db.todos.put(todo);
    todos.set([...allTodos]);
  }

  async function handleClearCompleted() {
    const allTodos = get(todos);
    const completedIds = allTodos.filter(t => t.completed).map(t => t.id);
    await db.todos.bulkDelete(completedIds);
    todos.set(allTodos.filter(t => !t.completed));
  }

  const filtered = derived([todos, filter], ([$todos, $filter]) => {
    if ($filter === 'active') return $todos.filter(t => !t.completed);
    if ($filter === 'completed') return $todos.filter(t => t.completed);
    return $todos;
  });
</script>

<!-- Container -->
<div class="flex flex-col items-center py-[40px] px-[20px] min-h-screen bg-[#f3f4f6] font-sans">
  <!-- Title -->
  <h1 class="text-[64px] text-[#fca5a5] font-light mb-[30px]">todos</h1>

  <!-- Todo Box -->
  <div class="bg-white w-full max-w-[600px] shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
    <!-- Input Row -->
    <div class="flex border-b border-[#e5e7eb]">
      <input
        type="text"
        placeholder="What needs to be done?"
        class="flex-1 px-4 py-4 text-[18px] text-[#333] border-none outline-none"
        bind:value={$newTodo}
        on:keydown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button
        class="bg-[#9ca3af] text-white px-[20px] my-[8px] mx-[8px] rounded-[6px] text-[16px] hover:bg-[#6b7280] cursor-pointer"
        on:click={handleAdd}
      >
        Add
      </button>
    </div>

    <!-- Todo List -->
    <ul class="list-none p-0 m-0">
      {#each $filtered as todo (todo.id)}
        <li class="flex items-center px-4 py-3 text-[18px] border-t border-[#e5e7eb]">
          <button
            class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center mr-3 cursor-pointer
              {todo.completed ? 'border-[#6ee7b7] text-[#6ee7b7]' : 'border-[#d1d5db]'}"
            on:click={() => handleToggle(todo.id)}
          >
            ✓
          </button>
          <span
            class="todo-text"
            class:text-[#1f2937]={!todo.completed}
            class:text-[#9ca3af]={todo.completed}
            class:line-through={todo.completed}
          >
            {todo.text}
          </span>
        </li>
      {/each}
    </ul>

    <!-- Footer -->
    {#if $todos.length > 0}
      <div class="flex justify-between items-center px-4 py-3 border-t border-[#e5e7eb] text-[14px] text-[#6b7280]">
        <span>{$todos.filter(t => !t.completed).length} item(s) left</span>

        <div class="flex gap-2">
          {#each ['all', 'active', 'completed'] as f}
            <button
              class="px-2 py-1 text-[14px] rounded border border-transparent cursor-pointer
                { $filter === f ? 'border-[#9ca3af]' : '' }"
              on:click={() => filter.set(f)}
            >
              {f}
            </button>
          {/each}
        </div>

        <button
          class="bg-none border-none text-[#6b7280] cursor-pointer hover:underline"
          on:click={handleClearCompleted}
        >
          Clear completed
        </button>
      </div>
    {/if}
  </div>
</div>
