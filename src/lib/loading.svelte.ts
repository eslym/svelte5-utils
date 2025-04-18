import { getContext, onDestroy, setContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';

/**
 * A store that tracks loading state.
 * It can be used to manage loading states in a Svelte application.
 */
export interface ReadonlyLoadingState {
	/**
	 * The current loading state.
	 * @readonly
	 */
	readonly value: boolean;

	/**
	 * Returns the current loading state or the provided value.
	 * @param other - The value to return if the loading state is false.
	 * @returns The current loading state or the provided value.
	 */
	or(other: any): boolean;

	/**
	 * Creates a scoped loading state.
	 * @param initial - The initial loading state.
	 * @returns A new loading state that is scoped to the current component.
	 */
	scoped(initial?: boolean): LoadingState;

	/**
	 * Creates a scoped loading state which is derived from a value.
	 * @param from - A function that returns the loading state.
	 * @returns A new loading state that is derived from the provided function.
	 */
	derived(from: () => boolean): ReadonlyLoadingState;

	/**
	 * Creates a loading state that is based on a promise.
	 * @param promise - The promise to track.
	 * @param delay - The delay before the loading state is set to true.
	 * @returns A new loading state that is based on the provided promise.
	 */
	promised(promise: Promise<any>, delay?: number): Pick<ReadonlyLoadingState, 'value' | 'or'>;
}

/**
 * A store that tracks loading state.
 * It can be used to manage loading states in a Svelte application.
 */
export interface LoadingState extends ReadonlyLoadingState {
	/**
	 * The current loading state.
	 */
	value: boolean;
}

function readonly_error() {
	throw new Error('Readonly property');
}

function create(get: () => boolean, set: (val: boolean) => void = readonly_error) {
	const values = new SvelteSet<{ readonly value: boolean }>();

	function current() {
		let value = get();
		for (const v of values) {
			value = value || v.value;
		}
		return value;
	}

	function scoped(initial = false) {
		let value = $state(initial);
		const store = create(
			() => value,
			(val) => (value = val)
		);
		onDestroy(values.delete.bind(values, store));
		values.add(store);
		return store;
	}

	function derived(from: () => boolean) {
		const store = create(from);
		onDestroy(values.delete.bind(values, store));
		values.add(store);
		return store;
	}

	function promised(promise: Promise<any>, delay = 0) {
		let value = $state(false);
		const store = {
			get value() {
				return value;
			},
			or(other: any) {
				return value || Boolean(other);
			}
		};
		const timeout = setTimeout(() => {
			value = true;
		}, delay);
		const cleanup = clearTimeout.bind(window, timeout);
		promise.finally(() => {
			value = false;
			cleanup();
		});
		onDestroy(values.delete.bind(values, store));
		values.add(store);
		return store;
	}

	return {
		get value() {
			return current();
		},
		set value(val: boolean) {
			set(val);
		},
		or(other: any) {
			return current() || Boolean(other);
		},
		scoped,
		derived,
		promised
	};
}

type UseLoading = {
	/**
	 * Creates a loading state.
	 * @param initial - The initial loading state.
	 * @returns A new loading state.
	 */
	(initial?: boolean): LoadingState;

	/**
	 * Creates a loading state which is derived from a value.
	 * @param from - A function that returns the loading state.
	 * @returns A new loading state that is derived from the provided function.
	 */
	derived: (from: () => boolean) => ReadonlyLoadingState;

	/**
	 * Get the loading state from the context.
	 * @returns The loading state from the context or null if not found.
	 */
	fromContext: () => ReadonlyLoadingState | null;

	/**
	 * Set the loading state in the context.
	 * @param state - The loading state to set in the context.
	 */
	setContext: (state: ReadonlyLoadingState) => void;

	/**
	 * The context key for the loading state.
	 */
	readonly contextKey: unique symbol;
};

const loading_symbol = Symbol('loading state');

/**
 * Creates a loading state.
 * @param initial - The initial loading state.
 * @returns A new loading state.
 */
export const useLoading: UseLoading = Object.assign(
	function useLoading(initial = false) {
		let value = $state(initial);
		return create(
			() => value,
			(val) => (value = val)
		);
	},
	{
		derived(from: () => boolean) {
			return create(from);
		},
		fromContext() {
			return getContext(loading_symbol) as ReadonlyLoadingState | null;
		},
		setContext(state: ReadonlyLoadingState) {
			setContext(loading_symbol, state);
		},
		get contextKey() {
			return loading_symbol as any;
		}
	}
);
