import { untrack } from 'svelte';

/**
 * The event that is fired when an update is attempted while the store is locked.
 */
export type LockedEvent<T> = CustomEvent<{
	/**
	 * The current value of the store.
	 */
	value: T;

	/**
	 * The new value that was attempted to be set.
	 */
	newValue: T;
}>;

export type LockedEventListener<T> = (ev: LockedEvent<T>) => void;

/**
 * A store that can be locked to prevent updates. The store will emit an event when an update is attempted while locked.
 */
export interface LockableStore<T> {
	/**
	 * The value of the store. If the store is locked, this value will not be updated.
	 * NOTE: if the value is object, the update to children will not be prevented.
	 */
	value: T;

	/**
	 * Get the current locked state of the store. If the store is locked, this will be true.
	 */
	readonly locked: boolean;

	/**
	 * Force the value of the store to be set, even if the store is locked. This will not emit an event.
	 */
	force(v: T): void;

	/**
	 * Listens for the `update-prevented` event. This event is fired when the store is locked and an update is attempted.
	 * The event detail contains the current value and the new value that was attempted to be set.
	 *
	 * @param listener - The listener function to be called when the event is fired.
	 * @param signal - An optional AbortSignal to remove the listener.
	 * @returns A function to remove the listener.
	 */
	onupdateprevented: (listener: LockedEventListener<T>, signal?: AbortSignal) => () => void;
}

/**
 * Creates a lockable store from a source object and a key. The store will emit an event when an update is attempted while the store is locked.
 * @param lock - A function that returns a boolean value. If the function returns true, the store is locked and updates are prevented.
 * @param accessor - An object with `get` and `set` methods to access the value of the store.
 * @return A lockable store object.
 * @example
 * ```svelte
 * <script lang="ts">
 *   let { open = $bindable(false) } = $props();
 *   let loading = $state(false);
 *   const dialogOpen = lockable(() => loading, {
 *      get: () => open, set: (v) => open = v
 *   });
 * </script>
 * <Dialog bind:open={dialogOpen.value} />
 */
function from<T>(
	lock: () => boolean,
	accessor:
		| {
				get: () => T;
				set: (v: T) => void;
		  }
		| { value: T }
): LockableStore<T> {
	if ('value' in accessor) {
		const store = accessor;
		accessor = {
			get: () => store.value,
			set: (v: T) => {
				store.value = v;
			}
		};
	}
	const listeners = new Set<(ev: LockedEvent<T>) => void>();
	function onupdateprevented(listener: LockedEventListener<T>, signal?: AbortSignal): () => void {
		listeners.add(listener);
		const cleanup = listeners.delete.bind(listeners, listener);
		if (signal) {
			signal.addEventListener('abort', cleanup, { once: true });
		}
		return cleanup;
	}
	const store = {
		get value() {
			return accessor.get();
		},
		set value(v: T) {
			const locked = lock();
			if (locked) {
				if (!listeners.size) return;
				for (const listener of listeners) {
					const old = untrack(() => accessor.get());
					listener(
						new CustomEvent('update-prevented', {
							detail: { value: old, newValue: v }
						})
					);
				}
			} else {
				accessor.set(v);
			}
		},
		get locked() {
			return lock();
		},
		get force() {
			return accessor.set;
		},
		get onupdateprevented() {
			return onupdateprevented;
		}
	};
	return store;
}

/**
 * Creates a lockable store. The store will emit an event when an update is attempted while the store is locked.
 * @param lock - A function that returns a boolean value. If the function returns true, the store is locked and updates are prevented.
 * @param value - The initial value of the store.
 * @returns A lockable store object.
 * @example
 * ```svelte
 * <script lang="ts">
 *  let loading = $state(false);
 *  const dialogOpen = lockable(() => loading, false);
 * </script>
 * <Dialog bind:open={dialogOpen.value} />
 * ```
 */
export const lockable = Object.assign(
	function lockable<T>(lock: () => boolean, value: T): LockableStore<T> {
		let val = $state(value);
		return from(lock, {
			get: () => val,
			set: (v: T) => {
				val = v;
			}
		});
	},
	{
		from
	}
);
