<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import GuideSidebar from '$lib/components/GuideSidebar.svelte';

	let cloudBg: HTMLElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		
		if (cloudBg) {
			gsap.to(cloudBg, {
				yPercent: 60,
				ease: "none",
				scrollTrigger: {
					trigger: document.body,
					start: "top top",
					end: "bottom top",
					scrub: true
				}
			});
		}
	});
</script>

<style>
	/* for overscroll */
	:global(body, html) {
		background: #CCF4FD;
	}
</style>

<div class="min-h-screen bg-gradient-to-b from-[#CCF4FD] to-[#cce7fd] relative overflow-hidden">
	<!-- Brushstroke texture overlay -->
	<div bind:this={cloudBg} class="absolute inset-0 bg-[url('cloud-texture-bg.png')] bg-size-[auto_50vh] bg-repeat pointer-events-none opacity-20"></div>
	<div class="absolute inset-0 bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>
	
	<GuideSidebar />
	<div class="lg:ml-90 prose prose-lg max-w-4xl mx-auto px-4 lg:px-16 lg:pl-24 py-16 prose-h1:font-serif prose-h1:not-first:mt-16 text-guide-text prose-bold relative z-10">
		<slot />
	</div>
</div>
