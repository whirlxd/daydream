<script>
	import { page } from '$app/state';
	
	const pages = [
		{ title: 'Welcome to Daydream!', href: '/guide', emoji: '⛅' },
		{ title: '0. Website', href: '/guide/website', emoji: '💻' },
		{ title: '1. Venue Guide', href: '/guide/venue', emoji: '🏠' },
		{ title: '2. Sponsorship Guide', href: '/guide/sponsors', emoji: '🤯' },
		{ title: '3. Outreach Guide', href: '/guide/outreach', emoji: '🎉' },
		{ title: '4. Branding Guide', href: '/guide/branding', emoji: '💗' },
		{ title: '5. Logistics', href: '/guide/logistics', emoji: '🎉' },
		{ title: '6. Day of', href: '/guide/day-of', emoji: '🌟' }
	];

	let isOpen = false;

	function toggleSidebar() {
		isOpen = !isOpen;
	}

	function closeSidebar() {
		isOpen = false;
	}
</script>

<!-- Mobile toggle button -->
<button 
	on:click={toggleSidebar}
	class="lg:hidden fixed top-6 right-6 z-50 p-3 bg-[url(/guide/sidebar-button.png)] bg-contain"
	aria-label="Toggle navigation"
>
	<svg class="w-6 h-6 text-[#8b4513]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
	</svg>
</button>

<!-- Mobile overlay -->
<div 
	class="lg:hidden fixed inset-0 bg-black/20 z-[55] transition-opacity duration-300 pointer-events-none {isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}"
	on:click={closeSidebar}
	on:keydown={(e) => e.key === 'Escape' && closeSidebar()}
	role="button"
	tabindex="0"
></div>

<!-- Sidebar -->
<nav class="fixed left-0 top-0 lg:w-90 w-[120vw] bg-[url('/paper-sidebar.png')] bg-contain bg-repeat-y h-screen overflow-y-auto transition-transform duration-300 z-[60] {
	isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
}">
	<!-- Content wrapper to constrain to screen width -->
	<div class="lg:w-full w-screen p-8">
		<!-- Header with close button -->
		<div class="flex items-center justify-between mb-4">
			<h3 class="font-serif text-lg text-[#8b4513]">Daydream Organizer Guide</h3>
			<button 
				on:click={closeSidebar}
				class="lg:hidden p-1 text-[#8b4513] hover:bg-[#8b4513]/10 rounded -translate-y-0.5"
				aria-label="Close navigation"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
		</div>
		<ul class="space-y-1">
			{#each pages as guideItem}
				<li>
					<a 
						href={guideItem.href}
						on:click={closeSidebar}
						class="block px-4 py-3 mr-8 text-lg rounded-md transition-colors duration-150 opacity-80 {
							page.url.pathname === guideItem.href
								? 'hover:bg-[#8b4513]/3' 
								: 'hover:bg-[#8b4513]/5'
						}"
						style={page.url.pathname === guideItem.href ? 'color: #e472ab; font-weight: bold' : 'color: #8b4513;'}
					>
						<span class="mr-2">{guideItem.emoji}</span> {guideItem.title}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>
