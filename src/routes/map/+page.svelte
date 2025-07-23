<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	/** @type {import('./$types').PageData} */
	export let data;
	
	let mapContainer: HTMLElement;
	let map: any;
	
	onMount(async () => {
		if (browser) {
			// Dynamically import Leaflet to avoid SSR issues
			const L = await import('leaflet');
			
			// Load CSS
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
			document.head.appendChild(link);
			
			// Initialize map
			map = L.map(mapContainer).setView([20, 0], 2);
			
			// Add tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
				detectRetina: true
			}).addTo(map);
			
			// Create custom icon using map-flag.png
			const flagIcon = L.icon({
				iconUrl: '/map-flag.png',
				iconSize: [32, 32],
				iconAnchor: [16, 32],
				popupAnchor: [0, -32]
			});
			
			// Add markers for each location (data is prerendered)
			data.locations.forEach((location: any) => {
				if (location.lat && location.lng) {
					const marker = L.marker([location.lat, location.lng], { icon: flagIcon })
						.addTo(map);
					
					// Create popup that shows on hover
					const popup = L.popup({
						closeButton: false,
						className: 'custom-popup'
					}).setContent(location.event_name);
					
					marker.bindPopup(popup);
					
					// Show popup on hover, hide on mouseout
					marker.on('mouseover', () => {
						marker.openPopup();
					});
					marker.on('mouseout', () => {
						marker.closePopup();
					});
				}
			});
		}
	});
</script>

<svelte:head>
	<title>Daydream Events Map</title>
</svelte:head>

<div bind:this={mapContainer} class="w-full h-screen"></div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	
	:global(.custom-popup .leaflet-popup-content-wrapper) {
		background: #FFFBDF !important;
		border: 1px solid #D3B180 !important;
		border-radius: 8px !important;
		box-shadow: 0 4px 8px rgba(211, 177, 128, 0.15) !important;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
	}
	
	:global(.custom-popup .leaflet-popup-content) {
		margin: 8px 12px !important;
		color: #78531D !important;
		font-size: 14px !important;
		font-weight: 500 !important;
		line-height: 1.2 !important;
	}
	
	:global(.custom-popup .leaflet-popup-tip) {
		background: #FFFBDF !important;
		border: 1px solid #D3B180 !important;
		border-top: none !important;
		border-right: none !important;
	}
</style>
