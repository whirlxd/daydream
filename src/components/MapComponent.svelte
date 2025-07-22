<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
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
			
			// Add custom popup styles
			const style = document.createElement('style');
			style.textContent = `
				.leaflet-tooltip.custom-tooltip {
					background: #FFFBDF !important;
					border: 1px solid #D3B180 !important;
					box-shadow: 0 3px 14px rgba(211, 177, 128, 0.15) !important;
					font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
					color: #78531D !important;
				}
				.leaflet-tooltip.custom-tooltip:before {
					border-top-color: #D3B180 !important;
				}
			`;
			document.head.appendChild(style);
			
			// Initialize map
			map = L.map(mapContainer).setView([20, 0], 2);
			
			// Add tile layer
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors'
			}).addTo(map);
			
			// Fetch and add event locations
			try {
				const response = await fetch('/api/map-data');
				if (response.ok) {
					const locations = await response.json();
					
					// Create custom icon
					const customIcon = L.icon({
						iconUrl: '/map-flag.png',
						iconSize: [32, 41],
						iconAnchor: [16, 41],
						popupAnchor: [1, -34]
					});

					// Add markers for each location
					locations.forEach((location: any) => {
						if (location.lat && location.lng) {
							L.marker([location.lat, location.lng], { icon: customIcon })
								.bindTooltip(`<strong>${location.event_name}</strong>`, {
									permanent: false,
									direction: 'top',
									className: 'custom-tooltip'
								})
								.addTo(map);
						}
					});
				}
			} catch (error) {
				console.error('Failed to load map data:', error);
			}
		}
	});
</script>

<div bind:this={mapContainer} class="w-full h-full"></div>
