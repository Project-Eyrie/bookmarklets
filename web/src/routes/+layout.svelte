<!-- Root layout that renders child pages -->
<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>OSINT Bookmarklets</title>
	<meta name="description" content="A collection of browser bookmarklets for open-source intelligence gathering across social media platforms." />
</svelte:head>

{@render children()}
