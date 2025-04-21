<script lang="ts">
	import { Toaster, toast } from 'svelte-sonner';
	import { componentize, wrapSnippet } from '$lib/index.js';

	const FormField = componentize(form_field);

	let world = $state('World');

	$inspect(world);
</script>

{#snippet toast_content(num: number)}
	Your number is <strong>{num}</strong>
{/snippet}

{#snippet form_field(props: { label: string; value?: string | null; id?: string })}
	{@const { id, label } = props}
	<div>
		<label for={id}>{label}</label>
		<input type="text" {id} bind:value={props.value} />
		<!-- use props.value for binding inside snippet -->
	</div>
{/snippet}

<FormField label="Hello" bind:value={world} id="hello_world" />
<p>
	<button
		onclick={() => {
			// create a snippet with random value on the fly
			const snippet = wrapSnippet(toast_content, Math.floor(Math.random() * 101));
			// create a component from the snippet
			const ToastContent = componentize(snippet);
			// pass the component to a function which accepts a component
			toast(ToastContent as any);
		}}
	>
		Give me a toast
	</button>
</p>

<Toaster position="top-right" />
