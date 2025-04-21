<script lang="ts" module>
	import Self from './Componentize.svelte';

	/**
	 * Wrap a Svelte Snippt into a Svelte Component.
	 * Useful when you want to create inline components.
	 * @param sippet The Svelte Snippet to wrap.
	 * @returns A Svelte Component.
	 * @example ```ts
	 * import type { Snippet } from 'svelte';
	 * import { componentize } from '@eslym/svelte5-utils';
	 * declare const form_field_snippet: Snippet<[]>;
	 * const FormField = componentize(form_field_snippet);
	 * // <FormField />
	 * ```
	 */
	export function componentize(snippet: Snippet<[props: {}, contexts: Map<any, any>]>): Component<{}, {}, ''>
	/**
	 * Wrap a Svelte Snippt into a Svelte Component.
	 * Useful when you want to create inline components.
	 * @param sippet The Svelte Snippet to wrap.
	 * @returns A Svelte Component.
	 * @example ```ts
	 * import type { Snippet } from 'svelte';
	 * import { componentize } from '@eslym/svelte5-utils';
	 * declare const form_field_snippet: Snippet<[params: { value: string; label: string; id?: string; }]>;
	 * const FormField = componentize(form_field_snippet);
	 * // Props could be bindable
	 * // <FormField bind:value={world} label="Hello" />
	 * ```
	 */
	 export function componentize<
		Props extends Record<string, any>,
		Bindings extends '' | keyof Props = string
	>(snippet: Snippet<[props: Props, contexts: Map<any, any>]>): Component<Props, {}, Bindings>
	export function componentize<
		Props extends Record<string, any>,
		Bindings extends '' | keyof Props = string
	>(snippet: Snippet<[props: Props, contexts: Map<any, any>]>): Component<Props, {}, Bindings> {
		return Object.assign(
			($$anchor: any, params: Props) => {
				const props = {
					$$slots: params.$$slots,
					$$events: params.$$events,
					$$legacy: params.$$legacy,
					snippet,
					params
				};
				delete params.$$slots;
				delete params.$$events;
				delete params.$$legacy;
				return Self($$anchor, props);
			},
			{ ...Self }
		) as any;
	}
</script>

<script lang="ts">
	import { getAllContexts, type Component, type Snippet } from 'svelte';

	let {
		snippet,
		params = {}
	}: {
		snippet: Snippet<[props: any, contexts: Map<any, any>]>;
		params?: any;
	} = $props();

	const contexts = getAllContexts();
</script>

{@render snippet(params, contexts)}
