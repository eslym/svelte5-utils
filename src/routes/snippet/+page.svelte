<script lang="ts">
	import MaybeSnippet from '$lib/MaybeSnippet.svelte';
</script>

{#snippet snippet(name: string)}
	Hello {name}!
{/snippet}

<p>
	<MaybeSnippet value={snippet} params={['John Doe']} />
</p>
<p>
	<MaybeSnippet value="Hello World!" />
</p>
<p>
	<MaybeSnippet value={null} params={['Fallback']} children={snippet} />
</p>
