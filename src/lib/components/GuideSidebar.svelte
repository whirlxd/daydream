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
</script>

<nav class="fixed left-0 top-0 w-90 bg-[url('/paper-sidebar.png')] bg-contain bg-repeat-y h-screen p-8 overflow-y-auto">
	<h3 class="font-serif text-lg mb-4 text-[#8b4513]">Daydream Organizer Guide</h3>
	<ul class="space-y-1">
		{#each pages as guideItem}
			<li>
				<a 
					href={guideItem.href}
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
</nav>
