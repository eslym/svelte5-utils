<script lang="ts">
	import { componentize } from '$lib/index.js';
	const FormField = componentize(form_field);

	let world = $state('World');

	$inspect(world);
</script>

{#snippet form_field(props: { label: string; value?: string | null; id?: string })}
	{@const { id, label } = props}
	<div>
		<label for={id}>{label}</label>
		<input type="text" {id} bind:value={props.value} />
        <!-- use props.value for binding inside snippet -->
	</div>
{/snippet}

<FormField label="Hello" bind:value={world} id="hello_world" />
