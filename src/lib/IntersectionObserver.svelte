<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ObserveAction = Action<
		HTMLElement,
		undefined,
		{
			onintersecting: (event: CustomEvent<IntersectionObserverEntry>) => void;
			oninview: (event: CustomEvent<IntersectionObserverEntry>) => void;
			onoutview: (event: CustomEvent<IntersectionObserverEntry>) => void;
		}
	>;

	let {
		children = undefined,
		as = 'div',
		ref = $bindable(null),
		root = $bindable(null),
		rootMargin = undefined,
		threshold = undefined,
		...rest
	}: {
		children?: Snippet<[observe: ObserveAction]>;
		as?: keyof HTMLElementTagNameMap;
		rootMargin?: string;
		threshold?: number | number[];
	} & (
		| {
				ref?: undefined;
				root: HTMLElement | null;
		  }
		| {
				ref?: HTMLElement | null;
				root?: undefined;
		  }
	) &
		Omit<IntersectionObserverInit, 'root'> &
		Omit<HTMLAttributes<HTMLElement>, 'children'> = $props();

	const observing = new Set<HTMLElement>();
	let observer: IntersectionObserver | null = null;

	if (!import.meta.env.SSR) {
		$effect.pre(() => {
			[ref, root, rootMargin, threshold];
			return untrack(() => {
				if (!(root || ref)) return;
				observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							entry.target.dispatchEvent(
								new CustomEvent('intersecting', {
									detail: entry
								})
							);
							entry.target.dispatchEvent(
								new CustomEvent(entry.isIntersecting ? 'inview' : 'outview', {
									detail: entry
								})
							);
						});
					},
					{ root: root ?? ref, rootMargin, threshold }
				);
				for (const el of observing) {
					observer.observe(el);
				}
				return () => {
					observer!.disconnect();
					observer = null;
				};
			});
		});
	}

	const observe: ObserveAction = (node) => {
		observer?.observe(node);
		observing.add(node);
		return {
			destroy() {
				if (observer) {
					observer.unobserve(node);
					observing.delete(node);
				}
			}
		};
	};
</script>

{#if !root}
	<svelte:element this={as} bind:this={ref} {...rest}>
		{@render children?.(observe)}
	</svelte:element>
{:else}
	{@render children?.(observe)}
{/if}
