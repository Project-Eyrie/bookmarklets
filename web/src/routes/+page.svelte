<!-- Main page: dynamically discovers bookmarklets from GitHub, converts them client-side, and renders a searchable catalog -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { generateBookmarklet } from '$lib/generator';

	interface Bookmarklet {
		title: string;
		desc: string;
		category: string;
		file: string;
		href: string;
		loading: boolean;
	}

	const REPO = 'Project-Eyrie/bookmarklets';
	const BRANCH = 'main';
	const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/bookmarklets`;
	const API_TREE = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;

	const categoryMap: Record<string, string> = {
		instagram: 'Instagram',
		facebook: 'Facebook',
		google: 'Google',
		reddit: 'Reddit',
		snapchat: 'Snapchat',
		threads: 'Threads',
		tiktok: 'TikTok',
		x: 'X (Twitter)',
		youtube: 'YouTube',
		tools: 'General Tools'
	};

	const categoryOrder = Object.keys(categoryMap);

	let bookmarklets = $state<Bookmarklet[]>([]);
	let search = $state('');
	let activeCategory = $state<string | null>(null);
	let showScrollTop = $state(false);
	let showModal = $state(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let loadingCount = $state(0);
	let totalCount = $state(0);

	// Resolves a folder name to a display category name
	function getCategoryName(folder: string): string {
		return categoryMap[folder] || folder.charAt(0).toUpperCase() + folder.slice(1);
	}

	// Returns the sort index for a category, unknown categories go to the end
	function getCategoryOrder(cat: string): number {
		const folder = Object.entries(categoryMap).find(([, v]) => v === cat)?.[0];
		const idx = folder ? categoryOrder.indexOf(folder) : -1;
		return idx >= 0 ? idx : 999;
	}

	// Parses title and description from structured comments, falls back to first-line comment and filename
	function parseMetadata(source: string, file: string, category: string): { title: string; desc: string } {
		const titleMatch = source.match(/\/\/\s*title:\s*"([^"]+)"/);
		const descMatch = source.match(/\/\/\s*description:\s*"([^"]+)"/);
		if (titleMatch) return { title: titleMatch[1], desc: descMatch?.[1] || '' };
		const firstLine = source.match(/^\/\/\s*(.+)/);
		const filename = file.split('/').pop()?.replace('.js', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || file;
		const fallbackTitle = category !== 'General Tools' ? `${category} ${filename}` : filename;
		return { title: fallbackTitle, desc: firstLine?.[1] || '' };
	}

	// Checks if a bookmarklet matches the current search query
	function matchesSearch(b: Bookmarklet): boolean {
		if (!search) return true;
		const q = search.toLowerCase();
		return `${b.title} ${b.desc} ${b.category}`.toLowerCase().includes(q);
	}

	// Returns bookmarklets grouped by category, filtered by search and active category
	function getGrouped(): { category: string; items: Bookmarklet[] }[] {
		const groups = new Map<string, Bookmarklet[]>();
		for (const b of bookmarklets) {
			if (!matchesSearch(b)) continue;
			if (activeCategory && b.category !== activeCategory) continue;
			if (!groups.has(b.category)) groups.set(b.category, []);
			groups.get(b.category)!.push(b);
		}
		return Array.from(groups.entries())
			.sort(([a], [b]) => getCategoryOrder(a) - getCategoryOrder(b))
			.map(([category, items]) => ({ category, items }));
	}

	const grouped = $derived(getGrouped());
	const filteredTotal = $derived(grouped.reduce((sum, g) => sum + g.items.length, 0));
	const categories = $derived([...new Set(bookmarklets.map((b) => b.category))].sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b)));

	// Selects a category filter and clears the search
	function selectCategory(cat: string | null) {
		activeCategory = cat;
		search = '';
	}

	// Handles keyboard shortcuts for search focus and escape
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === '/' && document.activeElement !== searchInput) {
			e.preventDefault();
			searchInput?.focus();
		}
		if (e.key === 'Escape') {
			search = '';
			showModal = false;
			searchInput?.blur();
		}
	}

	// Updates the back-to-top button visibility on scroll
	function handleScroll() {
		showScrollTop = window.scrollY > 500;
	}

	// Scrolls the page to the top with smooth animation
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Discovers bookmarklet files from GitHub, fetches source, and converts to bookmarklet URIs
	async function discoverAndLoad() {
		const treeRes = await fetch(API_TREE);
		const treeData = await treeRes.json();

		const jsFiles: { path: string; folder: string }[] = [];
		for (const item of treeData.tree) {
			if (item.type !== 'blob') continue;
			if (!item.path.startsWith('bookmarklets/')) continue;
			if (!item.path.endsWith('.js')) continue;
			const rel = item.path.replace('bookmarklets/', '');
			if (rel.startsWith('_')) continue;
			const parts = rel.split('/');
			if (parts.length !== 2) continue;
			jsFiles.push({ path: rel, folder: parts[0] });
		}

		totalCount = jsFiles.length;
		loadingCount = 0;

		bookmarklets = jsFiles.map((f) => ({
			title: '',
			desc: '',
			category: getCategoryName(f.folder),
			file: f.path,
			href: '#',
			loading: true
		}));

		await Promise.all(
			jsFiles.map(async (f, i) => {
				try {
					const res = await fetch(`${RAW_BASE}/${f.path}`);
					const source = await res.text();
					const meta = parseMetadata(source, f.path, getCategoryName(f.folder));
					const href = await generateBookmarklet(source);
					bookmarklets[i] = { ...bookmarklets[i], title: meta.title, desc: meta.desc, href, loading: false };
				} catch {
					bookmarklets[i] = { ...bookmarklets[i], title: f.path, desc: 'Failed to load', href: '#', loading: false };
				}
				loadingCount++;
			})
		);
	}

	onMount(discoverAndLoad);
</script>

<svelte:window onkeydown={handleKeydown} onscroll={handleScroll} />

<div class="mx-auto max-w-[1200px] px-6">
	<header class="flex flex-wrap items-baseline justify-between gap-2 pt-12 pb-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-[var(--text)]">OSINT Bookmarklets</h1>
			<p class="mt-1 text-xs text-[var(--text-tertiary)]">
				by <a href="https://notalex.sh/" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] no-underline hover:underline">notalex.sh</a>
				&middot;
				<a href="https://eyrie.notalex.sh/" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] no-underline hover:underline">Project Eyrie</a>
			</p>
		</div>
		<div class="flex flex-col items-end gap-1.5">
			<span class="text-sm text-[var(--text-tertiary)]">
				{#if totalCount > 0}
					{totalCount} bookmarklets
				{:else}
					&nbsp;
				{/if}
			</span>
			<div class="flex flex-wrap gap-2">
				<button
					onclick={() => (showModal = true)}
					class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.7rem] font-medium text-[var(--text-secondary)] no-underline transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
					How to install
				</button>
				<a
					href="https://markletsmith.notalex.sh/"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.7rem] font-medium text-[var(--text-secondary)] no-underline transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
					Make your own
				</a>
				<a
					href="https://github.com/{REPO}"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[0.7rem] font-medium text-[var(--text-secondary)] no-underline transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
					Source
				</a>
			</div>
		</div>
	</header>

	<p class="mb-4 text-[0.65rem] text-[var(--text-tertiary)]">If any bookmarklet gives incorrect or outdated results, refresh the page and try again.</p>

	<div class="sticky top-0 z-50 border-b border-transparent bg-[var(--bg)] py-4" class:border-b-[var(--border)]={showScrollTop}>
		<input
			type="text"
			bind:value={search}
			bind:this={searchInput}
			placeholder="Search bookmarklets..."
			autocomplete="off"
			spellcheck="false"
			class="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pr-4 pl-10 text-sm text-[var(--text)] outline-none transition-all focus:border-[var(--accent)] focus:ring-3 focus:ring-[var(--accent-light)]"
			style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23aeaeb2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'/%3E%3C/svg%3E&quot;); background-repeat: no-repeat; background-position: 0.8rem center; background-size: 16px;"
			oninput={() => { activeCategory = null; }}
		/>
		<div class="mt-2 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
			<span>
				{#if loadingCount < totalCount && totalCount > 0}
					<span class="inline-flex items-center gap-2">
						<span class="inline-block h-1 w-16 overflow-hidden rounded-full bg-[var(--tag-bg)]">
							<span class="block h-full rounded-full bg-[var(--accent)] transition-all duration-300" style="width: {Math.round((loadingCount / totalCount) * 100)}%"></span>
						</span>
						Loading {loadingCount}/{totalCount}
					</span>
				{:else}
					{filteredTotal === bookmarklets.length ? `${bookmarklets.length} bookmarklets` : `${filteredTotal} of ${bookmarklets.length} bookmarklets`}
				{/if}
			</span>
			<span>Press <kbd class="rounded border border-[var(--border)] bg-[var(--tag-bg)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[var(--tag-text)]">/</kbd> to search, <kbd class="rounded border border-[var(--border)] bg-[var(--tag-bg)] px-1.5 py-0.5 font-mono text-[0.65rem] text-[var(--tag-text)]">esc</kbd> to clear</span>
		</div>
	</div>

	<nav class="flex flex-wrap gap-1.5 py-4">
		<button
			class="rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeCategory === null ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]' : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}"
			onclick={() => selectCategory(null)}
		>All</button>
		{#each categories as cat}
			<button
				class="rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeCategory === cat ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]' : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:bg-[var(--surface)] hover:text-[var(--text)]'}"
				onclick={() => selectCategory(cat)}
			>{cat}</button>
		{/each}
	</nav>

	<main class="pb-16">
		{#each grouped as group}
			<section class="mb-10">
				<div class="mb-3 flex items-center gap-2.5">
					<h2 class="text-sm font-semibold text-[var(--text)]">{group.category}</h2>
					<span class="rounded-full bg-[var(--tag-bg)] px-2 py-0.5 text-[0.7rem] font-medium text-[var(--text-tertiary)]">{group.items.length}</span>
				</div>
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
					{#each group.items as b}
						{#if b.loading}
							<div class="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 pt-3.5 pb-3.5 opacity-60">
								<div class="flex-1 pb-2">
									<div class="mb-2 h-3.5 w-28 rounded-md bg-[var(--tag-bg)] shimmer"></div>
									<div class="h-2.5 w-44 rounded-md bg-[var(--tag-bg)] shimmer" style="animation-delay: 0.1s"></div>
								</div>
								<div class="h-7 w-24 rounded-lg bg-[var(--tag-bg)] shimmer" style="animation-delay: 0.2s"></div>
							</div>
						{:else}
							<div class="group flex flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--surface-hover)] hover:shadow-sm">
								<div class="flex-1 px-4 pt-3.5 pb-2">
									<div class="text-[0.8rem] font-medium text-[var(--text)] group-hover:text-[var(--accent)]">{b.title}</div>
									<div class="mt-0.5 text-[0.7rem] text-[var(--text-secondary)]">{b.desc}</div>
								</div>
								<div class="px-4 pb-3.5">
									<a
										href={b.href}
										class="inline-block rounded-lg border border-[var(--border)] bg-[var(--tag-bg)] px-3 py-1.5 text-[0.7rem] font-medium text-[var(--text-secondary)] no-underline transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
										style="cursor: grab;"
										ondragstart={() => {}}
									>{b.title}</a>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/each}

		{#if filteredTotal === 0 && loadingCount >= totalCount}
			<p class="py-16 text-center text-sm text-[var(--text-tertiary)]">No bookmarklets found</p>
		{/if}
	</main>
</div>

{#if showScrollTop}
	<button
		onclick={scrollToTop}
		class="fixed right-6 bottom-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)] shadow-md transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
	>&uarr; Back to top</button>
{/if}

{#if showModal}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
		onclick={(e) => { if (e.target === e.currentTarget) showModal = false; }}
		onkeydown={() => {}}
		role="dialog"
		aria-modal="true"
	>
		<div class="mx-4 w-full max-w-[480px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
			<h2 class="mb-4 text-base font-semibold text-[var(--text)]">How to install bookmarklets</h2>
			<ol class="mb-6 space-y-3 text-[0.75rem] leading-relaxed text-[var(--text-secondary)]">
				<li><span class="font-semibold text-[var(--text)]">1.</span> Make sure your bookmarks bar is visible (<kbd class="rounded border border-[var(--border)] bg-[var(--tag-bg)] px-1 py-0.5 text-[0.65rem]">Ctrl+Shift+B</kbd> / <kbd class="rounded border border-[var(--border)] bg-[var(--tag-bg)] px-1 py-0.5 text-[0.65rem]">Cmd+Shift+B</kbd>)</li>
				<li><span class="font-semibold text-[var(--text)]">2.</span> Drag any bookmarklet button from this page directly onto your bookmarks bar</li>
				<li><span class="font-semibold text-[var(--text)]">3.</span> Navigate to the target site and click the bookmarklet in your bookmarks bar to run it</li>
			</ol>
			<p class="mb-6 text-[0.7rem] text-[var(--text-tertiary)]">If a bookmarklet gives incorrect or outdated results, try refreshing the page and running it again.</p>
			<button
				onclick={() => (showModal = false)}
				class="w-full rounded-lg border border-[var(--border)] bg-[var(--tag-bg)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
			>Got it</button>
		</div>
	</div>
{/if}
