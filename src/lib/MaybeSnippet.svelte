<script lang="ts" module>
	import { BROWSER } from 'esm-env';
	import type { Snippet } from 'svelte';

	export type SnippetOrString<T extends any[]> = Snippet<T> | string | null | undefined;

	type Props<T extends any[]> = {
		value: SnippetOrString<T>;
		children?: SnippetOrString<T>;
	} & ([] extends T ? { params?: undefined | [] } : { params: T });

	function createRenderValue(value: string): Snippet {
		return (
			BROWSER
				? ($anchor: any) => (_renderValue as any)($anchor, () => value)
				: ($anchor: any) => (_renderValue as any)($anchor, value)
		) as any;
	}

	function createRenderSnippet<T extends any[]>(snippet: Snippet<T>, params: T): Snippet {
		return (
			BROWSER
				? ($anchor: any) => (snippet as any)($anchor, ...params.map((p) => () => p))
				: ($anchor: any) => (snippet as any)($anchor, ...params)
		) as any;
	}

	function wrapMaybeSnippet<T extends any[]>(
		snippet: SnippetOrString<T>,
		params: T
	): Snippet | null {
		if (typeof snippet === 'function') {
			return createRenderSnippet(snippet as any, params);
		}
		if (snippet !== null && snippet !== undefined) {
			return createRenderValue(snippet);
		}
		return null;
	}
</script>

<script lang="ts" generics="T extends any[]">
	let { value, children = undefined, params = [] as any }: Props<T> = $props();

	let renderValue = $derived(wrapMaybeSnippet(value, params));
	let renderFallback = $derived(wrapMaybeSnippet(children, params));

	let renderer = $derived(renderValue ?? renderFallback);
</script>

{#snippet _renderValue(value: string)}{value}{/snippet}

{@render renderer?.()}
