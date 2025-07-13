import type { Snippet } from 'svelte';
import { BROWSER } from 'esm-env';

type RestParams<T extends any[]> = number extends T['length']
	? never
	: 0 extends T['length']
		? never
		: 1 extends T['length']
			? T
			: T extends [...infer P, any]
				? P | RestParams<P>
				: never;

type Shift<T extends any[], N extends number, S extends any[] = []> = N extends S['length']
	? T
	: T extends [infer F, ...infer R]
		? Shift<R, N, [...S, F]>
		: T;

/**
 * Wrap a Svelte Snippet into a new Snippet with predefined parameters.
 * @param snippet The Svelte Snippet to wrap.
 * @param params The parameters to pass to the Snippet.
 * @returns A new Snippet with the parameters passed.
 * @example ```ts
 * import type { Snippet } from 'svelte';
 * import { wrapSnippet } from '@eslym/svelte5-utils';
 * declare const some_snippet: Snippet<[hello: string, world: string, johnDoe: string]>;
 * const snippet = wrapSnippet(some_snippet, 'Hello', 'World');
 * // snippet is now a Snippet<[johnDoe: string]>
 * ```
 */
export function wrapSnippet<T extends any[], P extends T | RestParams<T>>(
	snippet: Snippet<T>,
	...params: P
): Snippet<Shift<T, P['length']>> {
	if (BROWSER) {
		const p = params.map((v) => () => v);
		return (($anchor: any, ...args: any[]) => (snippet as any)($anchor, ...p, ...args)) as any;
	} else {
		return (($anchor: any, ...args: any[]) => (snippet as any)($anchor, ...params, ...args)) as any;
	}
}
