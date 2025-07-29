<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let colorChangeSpeed = 400;
	export let trailColorSpan = 25;
	export let trailThicknessStart = 3;
	export let trailThicknessEnd = 8;
	export let maxTrailLength = 15;
	export let blurIntensity = 10;
	export let blurOpacity = 0.75;
	export let mainOpacity = 0.25;

	onMount(() => {
		if (browser) {
			let mouseTrailPoints: Array<{ x: number; y: number }> = [];
			let animationId: number;

			function getHueFromIndex(index: number): number {
				return (index * 24) % 360;
			}

			function updateMouseTrail(e: MouseEvent) {
				const svgs = [document.querySelector('#trail-svg-blur')];
				if (svgs.find(svg => !svg)) return;

				const x = e.clientX;
				const y = e.clientY;

				mouseTrailPoints.push({ x, y });

				if (mouseTrailPoints.length > maxTrailLength) {
					mouseTrailPoints.shift();
				}

				if (mouseTrailPoints.length > 1) {
					svgs.forEach((svg: any) => {
						const oldPaths = svg.querySelectorAll('.trail-segment');
						const oldGradients = svg.querySelectorAll('.segment-gradient');
						oldPaths.forEach((path: any) => path.remove());
						oldGradients.forEach((grad: any) => grad.remove());

						let defs = svg.querySelector('defs');
						if (!defs) {
							defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
							svg.appendChild(defs);
						}
					});

					for (let i = 0; i < mouseTrailPoints.length - 1; i++) {
						const progress = i / (mouseTrailPoints.length - 1);
						const nextProgress = (i + 1) / (mouseTrailPoints.length - 1);

						const baseHue = getHueFromIndex(Date.now() / colorChangeSpeed);
						const hue1 = baseHue - (progress * trailColorSpan);
						const hue2 = baseHue - (nextProgress * trailColorSpan);

						svgs.forEach((svg: any, svgIndex: number) => {
							if (!svg) return;

							const defs = svg.querySelector('defs');
							if (!defs) return;

							const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
							gradient.classList.add('segment-gradient');
							gradient.setAttribute('id', `segment-gradient-${svgIndex}-${i}`);
							gradient.setAttribute('x1', '0%');
							gradient.setAttribute('y1', '0%');
							gradient.setAttribute('x2', '100%');
							gradient.setAttribute('y2', '0%');

							const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
							stop1.setAttribute('offset', '0%');
							stop1.setAttribute('stop-color', `hsl(${hue1}, 70%, 60%)`);

							const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
							stop2.setAttribute('offset', '100%');
							stop2.setAttribute('stop-color', `hsl(${hue2}, 70%, 60%)`);

							gradient.appendChild(stop1);
							gradient.appendChild(stop2);
							defs.appendChild(gradient);

							const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							path.classList.add('trail-segment');
							path.setAttribute('d', `M${mouseTrailPoints[i].x},${mouseTrailPoints[i].y} L${mouseTrailPoints[i + 1].x},${mouseTrailPoints[i + 1].y}`);
							path.setAttribute('stroke', `url(#segment-gradient-${svgIndex}-${i})`);
							path.setAttribute('stroke-width', `${trailThicknessStart + (trailThicknessEnd - trailThicknessStart) * progress}`);
							path.setAttribute('stroke-linecap', 'round');
							path.setAttribute('stroke-linejoin', 'round');
							path.setAttribute('fill', 'none');

							svg.appendChild(path);
						});
					}
				}
			}

			function clearMouseTrail() {
				mouseTrailPoints = [];
				const svgs = [document.querySelector('#trail-svg-blur')];
				svgs.forEach((svg: any) => {
					if (svg) {
						const oldPaths = svg.querySelectorAll('.trail-segment');
						oldPaths.forEach((path: any) => path.remove());
					}
				});
			}

			let frameCount = 0;
			function animateTrail() {
				frameCount++;

				if (frameCount % 3 === 0 && mouseTrailPoints.length > 0) {
					mouseTrailPoints.shift();

					const svgs = [document.querySelector('#trail-svg-blur')];
					if (mouseTrailPoints.length > 1 && !svgs.find(svg => !svg)) {
						svgs.forEach((svg: any) => {
							const oldPaths = svg.querySelectorAll('.trail-segment');
							const oldGradients = svg.querySelectorAll('.segment-gradient');
							oldPaths.forEach((path: any) => path.remove());
							oldGradients.forEach((grad: any) => grad.remove());

							let defs = svg.querySelector('defs');
							if (!defs) {
								defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
								svg.appendChild(defs);
							}
						});

						for (let i = 0; i < mouseTrailPoints.length - 1; i++) {
							const progress = i / (mouseTrailPoints.length - 1);
							const nextProgress = (i + 1) / (mouseTrailPoints.length - 1);

							const baseHue = getHueFromIndex(Date.now() / colorChangeSpeed);
							const hue1 = baseHue - (progress * trailColorSpan);
							const hue2 = baseHue - (nextProgress * trailColorSpan);

							svgs.forEach((svg: any, svgIndex: number) => {
								if (!svg) return;

								const defs = svg.querySelector('defs');
								if (!defs) return;

								const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
								gradient.classList.add('segment-gradient');
								gradient.setAttribute('id', `segment-gradient-${svgIndex}-${i}`);
								gradient.setAttribute('x1', '0%');
								gradient.setAttribute('y1', '0%');
								gradient.setAttribute('x2', '100%');
								gradient.setAttribute('y2', '0%');

								const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
								stop1.setAttribute('offset', '0%');
								stop1.setAttribute('stop-color', `hsl(${hue1}, 70%, 60%)`);

								const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
								stop2.setAttribute('offset', '100%');
								stop2.setAttribute('stop-color', `hsl(${hue2}, 70%, 60%)`);

								gradient.appendChild(stop1);
								gradient.appendChild(stop2);
								defs.appendChild(gradient);

								const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
								path.classList.add('trail-segment');
								path.setAttribute('d', `M${mouseTrailPoints[i].x},${mouseTrailPoints[i].y} L${mouseTrailPoints[i + 1].x},${mouseTrailPoints[i + 1].y}`);
								path.setAttribute('stroke', `url(#segment-gradient-${svgIndex}-${i})`);
								path.setAttribute('stroke-width', `${trailThicknessStart + (trailThicknessEnd - trailThicknessStart) * progress}`);
								path.setAttribute('stroke-linecap', 'round');
								path.setAttribute('stroke-linejoin', 'round');
								path.setAttribute('fill', 'none');

								svg.appendChild(path);
							});
						}
					}
				}

				animationId = requestAnimationFrame(animateTrail);
			}

			setTimeout(() => {
				const svgs = [document.querySelector('#trail-svg-blur')];

				if (!svgs.find(svg => !svg)) {
					document.addEventListener('mousemove', updateMouseTrail);
					document.addEventListener('mouseleave', clearMouseTrail);
					animateTrail();
				}
			}, 100);

			return () => {
				document.removeEventListener('mousemove', updateMouseTrail);
				document.removeEventListener('mouseleave', clearMouseTrail);
				if (animationId) {
					cancelAnimationFrame(animationId);
				}
			};
		}
	});
</script>

<!-- svelte-ignore component_name_lowercase -->
<svg id="trail-svg-blur" class="fixed top-0 left-0 w-full h-full pointer-events-none z-[9998]" style="filter: blur({blurIntensity}px); opacity: {blurOpacity}">
	<!-- Individual path segments will be added here dynamically -->
</svg>

<!-- svelte-ignore component_name_lowercase -->
<svg id="trail-svg-main" class="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]" style="filter: blur(3px) saturate(0) brightness(1000); opacity: {mainOpacity}">
	<!-- Individual path segments will be added here dynamically -->
</svg>
