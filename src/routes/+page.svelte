<script lang="ts">
	import { onMount } from "svelte";
	import Lenis from "lenis";

	function createSmoothPath(points: Array<{ x: number; y: number }>) {
		if (points.length < 2) return "";
		
		// Create smooth curves that flow horizontally through points
		const tension = 1.2; // Increased control point distance for smoother curves
		
		// Configurable angles for each point (in degrees)
		// 0 = horizontal, positive = upward slope, negative = downward slope
		const pointAngles = [0, 0, -10, -10, -10, 0, 0]; // Point 0: center, Point 0.5: left curve, Points 1-4: cards, Point 5: final card
		
		// Generate control points for smooth curves
		const controlPoints = [];
		
		for (let i = 0; i < points.length; i++) {
			let cp1, cp2;
			const angleRadians = (pointAngles[i] || 0) * Math.PI / 180; // Convert to radians
			
			if (i === 0) {
				// First point - start flowing at specified angle
				const next = points[i + 1];
				const distance = Math.sqrt(Math.pow(next.x - points[i].x, 2) + Math.pow(next.y - points[i].y, 2));
				
				// Start at specified angle - extend further
				const controlDistance = distance * tension * 0.8;
				
				cp1 = { x: points[i].x, y: points[i].y };
				cp2 = { 
					x: points[i].x + Math.cos(angleRadians) * controlDistance, 
					y: points[i].y + Math.sin(angleRadians) * controlDistance
				};
			} else if (i === points.length - 1) {
				// Last point - simple straight-down vertical approach
				const prev = points[i - 1];
				const distance = Math.sqrt(Math.pow(points[i].x - prev.x, 2) + Math.pow(points[i].y - prev.y, 2));
				
				// Create a simple curve that transitions smoothly to vertical
				const controlDistance = distance * tension * 0.4; // Reduced for simpler curve
				
				// First control point - minimal horizontal extension from previous point
				cp1 = { 
					x: prev.x + (points[i].x - prev.x) * 0.7, // Move most of the way horizontally
					y: prev.y + (points[i].y - prev.y) * 0.3   // Move only slightly vertically
				};
				
				// Second control point - directly above target for straight-down approach
				cp2 = { 
					x: points[i].x, // Directly above the target point
					y: points[i].y - controlDistance * 0.5 // Close approach from above
				};
			} else {
				// Middle points - flow at specified angle through the point
				const prev = points[i - 1];
				const next = points[i + 1];
				
				// Calculate distances for proportional control
				const prevDistance = Math.sqrt(Math.pow(points[i].x - prev.x, 2) + Math.pow(points[i].y - prev.y, 2));
				const nextDistance = Math.sqrt(Math.pow(next.x - points[i].x, 2) + Math.pow(next.y - points[i].y, 2));
				
				// Determine if we're going left-to-right or right-to-left based on position in sequence
				const isEven = i % 2 === 0;
				const flowDirection = isEven ? 1 : -1; // Even indices flow right, odd flow left
				
				// Control distances based on adjacent point distances - extend much further
				const leftControlDistance = prevDistance * tension * 0.7;
				const rightControlDistance = nextDistance * tension * 0.7;
				
				if (flowDirection > 0) {
					// Flowing left to right at specified angle
					cp1 = { 
						x: points[i].x - Math.cos(angleRadians) * leftControlDistance, 
						y: points[i].y - Math.sin(angleRadians) * leftControlDistance
					};
					cp2 = { 
						x: points[i].x + Math.cos(angleRadians) * rightControlDistance, 
						y: points[i].y + Math.sin(angleRadians) * rightControlDistance
					};
				} else {
					// Flowing right to left at specified angle (flip direction)
					cp1 = { 
						x: points[i].x + Math.cos(angleRadians) * leftControlDistance, 
						y: points[i].y + Math.sin(angleRadians) * leftControlDistance
					};
					cp2 = { 
						x: points[i].x - Math.cos(angleRadians) * rightControlDistance, 
						y: points[i].y - Math.sin(angleRadians) * rightControlDistance
					};
				}
			}
			
			controlPoints.push({ cp1, cp2 });
		}
		
		// Build the smooth path
		let path = `M ${points[0].x} ${points[0].y}`;
		
		for (let i = 1; i < points.length; i++) {
			const prevControls = controlPoints[i - 1];
			const currControls = controlPoints[i];
			
			path += ` C ${prevControls.cp2.x} ${prevControls.cp2.y}, ${currControls.cp1.x} ${currControls.cp1.y}, ${points[i].x} ${points[i].y}`;
		}
		
		return path;
	}

	function getPointAlongPath(points: Array<{ x: number; y: number }>, percentage: number) {
		if (points.length < 2) return { x: 0, y: 0, angle: 0 };
		
		// Generate the same control points as the path
		const tension = 1.2;
		const pointAngles = [0, 0, -10, -10, -10, 0, 0];
		const controlPoints = [];
		
		for (let i = 0; i < points.length; i++) {
			let cp1, cp2;
			const angleRadians = (pointAngles[i] || 0) * Math.PI / 180;
			
			if (i === 0) {
				const next = points[i + 1];
				const distance = Math.sqrt(Math.pow(next.x - points[i].x, 2) + Math.pow(next.y - points[i].y, 2));
				const controlDistance = distance * tension * 0.8;
				
				cp1 = { x: points[i].x, y: points[i].y };
				cp2 = { 
					x: points[i].x + Math.cos(angleRadians) * controlDistance, 
					y: points[i].y + Math.sin(angleRadians) * controlDistance
				};
			} else if (i === points.length - 1) {
				const prev = points[i - 1];
				const distance = Math.sqrt(Math.pow(points[i].x - prev.x, 2) + Math.pow(points[i].y - prev.y, 2));
				const controlDistance = distance * tension * 0.4;
				
				cp1 = { 
					x: prev.x + (points[i].x - prev.x) * 0.7, 
					y: prev.y + (points[i].y - prev.y) * 0.3
				};
				
				cp2 = { 
					x: points[i].x, 
					y: points[i].y - controlDistance * 0.5
				};
			} else {
				const prev = points[i - 1];
				const next = points[i + 1];
				
				const prevDistance = Math.sqrt(Math.pow(points[i].x - prev.x, 2) + Math.pow(points[i].y - prev.y, 2));
				const nextDistance = Math.sqrt(Math.pow(next.x - points[i].x, 2) + Math.pow(next.y - points[i].y, 2));
				
				const isEven = i % 2 === 0;
				const flowDirection = isEven ? 1 : -1;
				
				const leftControlDistance = prevDistance * tension * 0.7;
				const rightControlDistance = nextDistance * tension * 0.7;
				
				if (flowDirection > 0) {
					cp1 = { 
						x: points[i].x - Math.cos(angleRadians) * leftControlDistance, 
						y: points[i].y - Math.sin(angleRadians) * leftControlDistance
					};
					cp2 = { 
						x: points[i].x + Math.cos(angleRadians) * rightControlDistance, 
						y: points[i].y + Math.sin(angleRadians) * rightControlDistance
					};
				} else {
					cp1 = { 
						x: points[i].x + Math.cos(angleRadians) * leftControlDistance, 
						y: points[i].y + Math.sin(angleRadians) * leftControlDistance
					};
					cp2 = { 
						x: points[i].x - Math.cos(angleRadians) * rightControlDistance, 
						y: points[i].y - Math.sin(angleRadians) * rightControlDistance
					};
				}
			}
			
			controlPoints.push({ cp1, cp2 });
		}
		
		// Calculate which segment and position within that segment
		const segmentCount = points.length - 1;
		const segmentPercentage = percentage * segmentCount;
		const segmentIndex = Math.floor(segmentPercentage);
		const t = segmentPercentage - segmentIndex;
		
		// Clamp to valid range
		const clampedIndex = Math.min(segmentIndex, segmentCount - 1);
		const clampedT = clampedIndex === segmentIndex ? t : 1;
		
		// Get the Bézier curve points for this segment
		const p0 = points[clampedIndex];
		const p1 = controlPoints[clampedIndex].cp2;
		const p2 = controlPoints[clampedIndex + 1].cp1;
		const p3 = points[clampedIndex + 1];
		
		// Calculate position on cubic Bézier curve
		const x = Math.pow(1 - clampedT, 3) * p0.x + 
				  3 * Math.pow(1 - clampedT, 2) * clampedT * p1.x + 
				  3 * (1 - clampedT) * Math.pow(clampedT, 2) * p2.x + 
				  Math.pow(clampedT, 3) * p3.x;
		
		const y = Math.pow(1 - clampedT, 3) * p0.y + 
				  3 * Math.pow(1 - clampedT, 2) * clampedT * p1.y + 
				  3 * (1 - clampedT) * Math.pow(clampedT, 2) * p2.y + 
				  Math.pow(clampedT, 3) * p3.y;
		
		// Calculate tangent for rotation
		const dx = 3 * Math.pow(1 - clampedT, 2) * (p1.x - p0.x) + 
				   6 * (1 - clampedT) * clampedT * (p2.x - p1.x) + 
				   3 * Math.pow(clampedT, 2) * (p3.x - p2.x);
		
		const dy = 3 * Math.pow(1 - clampedT, 2) * (p1.y - p0.y) + 
				   6 * (1 - clampedT) * clampedT * (p2.y - p1.y) + 
				   3 * Math.pow(clampedT, 2) * (p3.y - p2.y);
		
		let angle = Math.atan2(dy, dx) * 180 / Math.PI;
		
		// Keep the plane oriented to follow the curve naturally
		// Allow flipping but ensure it's always pointing in the direction of travel
		
		return { x, y, angle };
	}



	let currentAirplaneProgress = 0;
	let animationFrameId: number | null = null;
	let isFlipped = false;
	let showVideoPopup = false;

	function openVideoPopup() {
		// Check if screen is small (mobile/tablet)
		if (window.innerWidth <= 768) {
			// Open video directly in new tab for small screens
			window.open('https://www.youtube.com/watch?v=O44y8TeJrNE', '_blank');
		} else {
			// Show popup for larger screens
			showVideoPopup = true;
		}
	}

	function closeVideoPopup() {
		showVideoPopup = false;
	}

	function handleFormSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
		const email = emailInput.value;
		
		// Find the hidden form and submit it
		const hiddenForm = document.getElementById('hidden-signup-form') as HTMLFormElement;
		const hiddenEmailInput = hiddenForm.querySelector('input[name="email"]') as HTMLInputElement;
		hiddenEmailInput.value = email;
		hiddenForm.submit();
		
		// Open the Hackclub form with email parameter
		window.open(`https://forms.hackclub.com/daydream?email=${encodeURIComponent(email)}`, '_blank');
		
		// Clear the email input
		emailInput.value = '';
	}

	function updateAirplanePosition() {
		const container = document.getElementById("islands-container");
		const airplane = document.getElementById("paper-airplane");
		
		if (!container || !airplane) return;
		
		const containerRect = container.getBoundingClientRect();
		const windowHeight = window.innerHeight;
		
		// Calculate scroll progress based on container position
		// Start animation earlier and extend it longer for full path completion
		const scrollStart = containerRect.top + window.scrollY - windowHeight * 0.7;
		const scrollEnd = containerRect.bottom + window.scrollY - windowHeight;
		const currentScroll = window.scrollY;
		
		// Calculate progress (0 to 1)
		let progress = (currentScroll - scrollStart) / (scrollEnd - scrollStart);
		progress = Math.max(0, Math.min(1, progress));
		
		// Apply ease-in-out curve for smoother animation
		const easingStrength = 1.0; // 0 = linear, 1 = full ease-in-out
		const easedProgress = progress * progress * (3 - 2 * progress);
		progress = progress * (1 - easingStrength) + easedProgress * easingStrength;
		
		// Smooth the movement with interpolation and max speed
		const maxSpeed = 0.001; // Maximum progress change per frame
		const targetDifference = progress - currentAirplaneProgress;
		const speedLimitedDifference = Math.sign(targetDifference) * Math.min(Math.abs(targetDifference), maxSpeed);
		const previousProgress = currentAirplaneProgress;
		currentAirplaneProgress += speedLimitedDifference;
		
		// Determine movement direction
		const movingForward = currentAirplaneProgress > previousProgress;
		

		
		// Get points for path calculation
		const points: Array<{ x: number; y: number }> = [];
		const pointIds = ["0", "0.5", "1", "2", "3", "4", "5"];
		pointIds.forEach(id => {
			const element = document.querySelector(`[data-point="${id}"]`);
			if (element) {
				const rect = element.getBoundingClientRect();
				points.push({
					x: rect.left + rect.width / 2 - containerRect.left,
					y: rect.top + rect.height / 2 - containerRect.top
				});
			}
		});
		
		if (points.length > 0) {
			const airplanePos = getPointAlongPath(points, currentAirplaneProgress);
			airplane.style.left = `${airplanePos.x}px`;
			airplane.style.top = `${airplanePos.y}px`;
			
			// Check if rotation angle is greater than 90 degrees (plane is upside down)
			// Normalize angle to -180 to 180 range
			let normalizedAngle = airplanePos.angle;
			while (normalizedAngle > 180) normalizedAngle -= 360;
			while (normalizedAngle < -180) normalizedAngle += 360;
			
			// Flip plane if angle is outside -90 to 90 degree range (keeps plane right side up)
			isFlipped = Math.abs(normalizedAngle) > 90;
			
			// Apply vertical flip if needed
			const verticalFlip = isFlipped ? ' scaleY(-1)' : '';
			airplane.style.transform = `translate(-50%, calc(-50% - 0.5rem)) rotate(${airplanePos.angle}deg)${verticalFlip}`;
		}
		
		// Continue animation if still moving
		if (Math.abs(progress - currentAirplaneProgress) > 0.001) {
			animationFrameId = requestAnimationFrame(updateAirplanePosition);
		}
	}

	function updatePath() {
		const container = document.getElementById("islands-container");
		const pathElement = document.getElementById("dotted-path");
		
		if (!container || !pathElement) return;
		
		const containerRect = container.getBoundingClientRect();
		const points: Array<{ x: number; y: number }> = [];
		
		// Get points in order by data-point attribute
		const pointIds = ["0", "0.5", "1", "2", "3", "4", "5"];
		pointIds.forEach(id => {
			const element = document.querySelector(`[data-point="${id}"]`);
			if (element) {
				const rect = element.getBoundingClientRect();
				points.push({
					x: rect.left + rect.width / 2 - containerRect.left,
					y: rect.top + rect.height / 2 - containerRect.top
				});
			}
		});
		
		const pathData = createSmoothPath(points);
		pathElement.setAttribute("d", pathData);
		
		// Update airplane position based on scroll
		updateAirplanePosition();
	}

	onMount(() => {
		// smooth scroll
		const lenis = new Lenis({
		autoRaf: true,
		});

		// Initial path calculation
		setTimeout(updatePath, 100);
		
		// Update on scroll and resize
		window.addEventListener("scroll", updateAirplanePosition);
		window.addEventListener("resize", updatePath);
		
		// Cleanup
		return () => {
			window.removeEventListener("scroll", updateAirplanePosition);
			window.removeEventListener("resize", updatePath);
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	});
</script>

<style>
	:global(body) {
		background-color: #CCF4FD;
	}
</style>

<svelte:head>
	<title>Daydream</title>
</svelte:head>

<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-size-[100vw_100vh] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>

<div class="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-[#CCF4FD] to-[#B8D9F8] bg-blend-overlay">

	<div class="absolute top-0 left-0 w-full h-full bg-[url(/buildings-back.png)] bg-no-repeat bg-contain pointer-events-none lg:-translate-y-15"></div>
	<div class="absolute top-0 left-0 w-full h-full bg-[url(/buildings-front.png)] bg-no-repeat bg-contain pointer-events-none lg:-translate-y-15"></div>
	<!-- brush texture clipped to buildings -->
	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat pointer-events-none opacity-100 -translate-y-15 bg-center mix-blend-overlay" style="mask-image: url('/buildings-top.png'); mask-size: contain; mask-repeat: no-repeat; mask-position: center top; -webkit-mask-image: url('/buildings-top.png'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center top;"></div>
	<div class="inline-block relative">
		<h2
			class="text-xl font-serif bg-gradient-to-b from-[#487DAB] to-[#3F709A] bg-clip-text text-transparent absolute left-[calc(50%+4rem)] -translate-x-1/2 bottom-8 italic w-max md:text-lg sm:text-base"
		>
			September 27th & 28th, 2025
		</h2>
		<img src="daydream.png" alt="Daydream" class="h-40 mb-6 w-auto object-contain max-w-full px-4" />
	</div>
	<div class="relative inline-block px-4">
		<h3
			class="text-3xl italic font-serif bg-gradient-to-b from-[#487DAB] to-[#3F709A] bg-clip-text text-transparent"
		>
			Game jam for high schoolers
		</h3>
		<img
			src="underline.svg"
			alt=""
			class="absolute left-1/2 -translate-x-1/2 -mt-1 h-auto scale-115"
		/>
		<h4
			class="text-2xl opacity-90 mt-2 font-serif bg-gradient-to-b from-[#487DAB] to-[#3F709A] bg-clip-text text-transparent"
		>
			Organized by high schoolers in 100 cities worldwide
		</h4>
	</div>
	
	<div class="mt-8 flex flex-col items-center gap-3 z-10 max-md:scale-90">
		<form on:submit={handleFormSubmit} class="rounded-full bg-white border-2 border-dark font-sans p-2 flex flex-row items-center gap-2 shadow-[0_3px_0_0_theme(colors.dark)] focus-within:border-pink focus-within:shadow-[0_3px_0_0_#E472AB] has-[button:active]:border-dark has-[button:active]:shadow-[0_3px_0_0_theme(colors.dark)] has-[button:focus]:border-dark has-[button:focus]:shadow-[0_3px_0_0_theme(colors.dark)]">
			<input
				type="email"
				name="email"
				placeholder="Enter email to organize Daydream"
				class="w-80 px-3 py-1 text-dark focus:outline-none"
				required
			/>
			<input type="hidden" name="mailingLists" value="cmd3c94kz0hvz0iwt7ps28cyd" />
			<button type="submit" class="bg-light h-full px-5 rounded-full border-b-2 border-[#B3866A] cursor-pointer hover:border-b-4 hover:transform hover:-translate-y-0.5 active:border-b-0 active:transform active:translate-y-0.5 focus:outline-none transition-all duration-100">
				<img src="submit.svg" alt="Go">
			</button>
		</form>
		<a
			href="https://forms.hackclub.com/daydream-stickers"
			target="_blank"
			class="w-max px-4 py-2 bg-pink border-b-2 border-b-pink-dark text-white rounded-full active:transform active:translate-y-0.5 transition-all duration-100 font-sans cursor-pointer mx-auto relative overflow-hidden hover:shadow-[0_2px_0_0_theme(colors.pink.dark)] hover:-translate-y-[2px] active:border-transparent active:shadow-none active:"
		>
			Get free stickers
			<img
				src="button-clouds.svg" 
				alt="" 
				class="absolute bottom-0 left-1/2 -translate-x-1/2 w-auto object-contain pointer-events-none"
			>
		</a>
	</div>

	<!-- <img src="hot-air-balloon.png" alt="" class="absolute w-1/8 right-32 bottom-40 z-20"> -->
	<!-- <img src="hot-air-balloon.png" alt="" class="absolute w-1/12 left-36 bottom-81 z-20"> -->

	<img src="/clouds-top-middle-bg.svg" alt="" class="absolute left-5/12 -translate-x-1/2 w-7/12 -bottom-24">
	<div class="absolute left-5/12 -translate-x-1/2 w-7/12 -bottom-24 bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none h-full" style="mask-image: url('/clouds-top-middle-bg.svg'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('/clouds-top-middle-bg.svg'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"></div>
	
	<img src="/clouds-top-right-bg.svg" alt="" class="absolute right-0 w-1/2 -bottom-12 translate-y-1/2">
	<div class="absolute right-0 w-1/2 -bottom-12 translate-y-1/2 bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none h-full" style="mask-image: url('/clouds-top-right-bg.svg'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('/clouds-top-right-bg.svg'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"></div>
	
	<img src="/clouds-top-left-bg.svg" alt="" class="absolute left-0 w-3/12 -bottom-12  translate-y-1/2">
	<div class="absolute left-0 w-3/12 -bottom-12 translate-y-1/2 bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none h-full" style="mask-image: url('/clouds-top-left-bg.svg'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url('/clouds-top-left-bg.svg'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"></div>
	
	<img src="/clouds-top-middle.png" alt="" class="absolute left-5/12 -translate-x-1/2 w-7/12 -bottom-24">
	<img src="/clouds-top-right.png" alt="" class="absolute right-0 w-1/2 -bottom-12 translate-y-1/2">
	<img src="/clouds-top-left.png" alt="" class="absolute left-0 w-3/12 -bottom-12  translate-y-1/2">
	
	<!-- Video Thumbnail Button -->
	<button
		on:click={openVideoPopup}
		class="absolute bottom-8 right-8 max-sm:right-1/2 max-sm:translate-x-1/2 w-40 h-24 rounded overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group md:w-72 md:h-40 sm:w-40 sm:h-24 animate-hover"
	>
		<img src="thumbnail.png" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
		<div class="absolute inset-0 bg-[rgba(0,0,0,0.1)] bg-opacity-30 group-hover:bg-opacity-20 transition-colors duration-300 flex items-center justify-center">
			<div class="scale-150 w-8 h-8 bg-[rgba(255,255,255,0.5)] bg-opacity-20 rounded-full flex items-center justify-center md:w-6 md:h-6 sm:w-4 sm:h-4">
				<div class="w-0 h-0 border-l-[8px] border-l-[rgba(255,255,255,1)] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-1 md:border-l-[6px] md:border-t-[4px] md:border-b-[4px] sm:border-l-[4px] sm:border-t-[3px] sm:border-b-[3px]"></div>
			</div>
		</div>
	</button>
</div>

<div class="w-full relative flex items-start justify-center min-h-screen">
	<!-- background -->
	<div class="absolute top-0 left-0 w-full h-full -z-50 bg-[#FCEFC5]"></div>
	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-30 pointer-events-none -z-40"></div>
	
	<div class="relative max-w-4xl mx-auto h-full flex items-start pt-24 px-8">
		<div class="relative z-20 px-20 pt-20 pb-32 rounded-lg mb-0" style="background-image: url('/letter-top.png'), linear-gradient(to bottom, #FCEFC5 100px, transparent 100px), url('/letter-loop.png'); background-size: 100% auto, 100% auto, 100% auto; background-repeat: no-repeat, no-repeat, repeat-y; background-position: top, top, top; background-attachment: local, local, local;">
			<h2 class="text-5xl font-serif italic text-[#8B4513] mb-10 relative">
				Dear Hacker,
				<img src="/underline.svg" alt="" class="absolute left-0 -bottom-3 w-64 h-auto opacity-70">
			</h2>
			
			<div class="text-[#8B4513] font-serif text-xl leading-relaxed space-y-8">
				<p>
					Hackathons are <em class="italic font-bold">magical</em>. You've probably felt it before: staying up all night 
					with your friends, building something that actually works, finally meeting 
					everyone whose code you've admired. That rush when your code compiles at 3:00 am 
					and suddenly your wild idea becomes real.
				</p>
				
				<p class="font-bold text-2xl">
					Hack Club wants you to organize a hackathon.
				</p>
				
				<p>
					We want more hackers than ever from all over the world to have this life 
					changing experience, and we want your help in making that happen.
				</p>
				
				<p>
					Sign up to organize a Daydream event in your city! All of our hackathons are 
					teen-led. You do not need to have any previous experience, and Hack Club 
					will provide you with funding and coaching.
				</p>
				
				<p>
					Our goal is to get <span class="font-bold">4,000 Hack Clubbers</span> to make projects they're proud of 
					through Daydream, and we're giving out over <span class="font-bold">$120k in funding</span> to organizers 
					like you!
				</p>
				
				<p class="text-center font-bold text-2xl mt-10 text-[#2C3E50]">
					Check out our <a class="underline hover:text-pink" href="https://www.youtube.com/watch?v=O44y8TeJrNE">video!</a>
				</p>
			</div>
		</div>
	</div>

	<div class="w-full absolute z-30 max-h-64 bottom-0 max-lg:translate-y-1/2 pointer-events-none">	
		<img src="/cloud-cover-1.png" alt="" class="w-full h-full object-contain">
		<!-- Invisible marker for airplane starting point -->
		<div class="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2" data-point="0"></div>
		<!-- Intermediate point to the left -->
		<div class="absolute top-1/2 left-1/4 w-1 h-1 -translate-x-1/2 -translate-y-1/2" data-point="0.5"></div>
	</div>
	<div class="absolute -bottom-44 left-1/2 -translate-x-1/2 w-10/12 lg:max-w-2/3 h-auto object-contain z-100 cursor-text flex flex-row max-md:flex-wrap items-center justify-center align-middle">
		<img src="gamejam-1.png" alt="Here's How You Organize a" class="flex-shrink min-w-0 object-contain">
		<img src="gamejam-2.png" alt="Game Jam" class="flex-shrink min-w-0 object-contain">
	</div>
</div>
<div class="w-full h-64 bg-[#FCEFC5]"></div>

<div class="flex flex-row flex-wrap w-full h-auto bg-gradient-to-b from-[#FCEFC5] to-[#FEC1CF] px-36 pb-50 relative" id="islands-container">

	<img src="/clouds-left-2.png" alt="" class="absolute left-0 w-3/12 top-12">
	<img src="/clouds-left-3.png" alt="" class="absolute left-0 w-2/12 bottom-32">
	<img src="/clouds-right-2.png" alt="" class="absolute right-0 w-3/12 bottom-0">

	<!-- SVG Path Overlay -->
	<svg class="absolute inset-0 w-full h-full pointer-events-none z-0" id="path-svg">
		<path id="dotted-path" stroke="rgba(255,255,255,0.5)" stroke-width="3" fill="none" stroke-dasharray="8,8" opacity="0.7"></path>
	</svg>

	<img src="paper-airplane.png" alt="Paper airplane" class="h-16 absolute z-10" id="paper-airplane">

	<div class="flex flex-col items-center w-max basis-1/2 z-10">
		<div class="relative translate-y-8">
			<img src="/letter-1-front.png" alt="" class="object-contain absolute -bottom-16 -left-13 w-28 h-28">
			<img src="/letter-1-back.png" alt="" class="object-contain absolute -bottom-16 -left-13 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="1">
				<span class="font-sans text-[#E472AB] font-bold text-[1.3rem] mr-1">#1:</span> Find a team of co-organizers
			</div>
		</div>
		<img src="/island-1.png" alt="" class="w-72 h-72 object-contain">
	</div>

	<div class="flex flex-col items-center w-max basis-1/2 translate-y-24 z-10">
		<div class="relative translate-y-24">
			<img src="/letter-2-front.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28">
			<img src="/letter-2-back.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="2">
				<span class="font-sans text-[#639DEB] font-bold text-[1.3rem] mr-1">#2:</span> Find a venue to host your hackathon
			</div>
		</div>
		<img src="/island-3.png" alt="" class="w-86 h-86 object-contain">
	</div>
	<div class="flex flex-col items-center w-max basis-1/2 -translate-x-12 z-10">
		<div class="relative translate-y-8">
			<img src="/letter-3-front.png" alt="" class="object-contain absolute -bottom-18 left-24 w-28 h-28">
			<img src="/letter-3-back.png" alt="" class="object-contain absolute -bottom-18 left-24 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="3">
				<span class="font-sans text-[#AB68E2] font-bold text-[1.3rem] mr-1">#3:</span> Find sponsors to buy merch and prizes
			</div>
		</div>
		<img src="/island-2.png" alt="" class="w-72 h-72 object-contain">
	</div>
		<div class="flex flex-col items-center w-max basis-1/2 translate-y-30 z-10">
		<div class="relative translate-y-24">
			<img src="/letter-4-front.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28">
			<img src="/letter-4-back.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="4">
				<span class="font-sans text-[#F2993E] font-bold text-[1.3rem] mr-1">#4:</span> Buy supplies, order food, and prepare workshops
			</div>
		</div>
		<img src="/island-4.png" alt="" class="w-88 h-88 object-contain">
	</div>

	<!-- Final Card -->
	<div class="flex flex-col items-center w-full basis-full translate-y-40 z-20">
		<div class="relative">
			<div class="bg-[url('/card-final.png')] bg-contain bg-no-repeat bg-center text-2xl font-serif pt-24 px-8 w-128 h-96 text-center" data-point="5">
				<span class="font-sans text-[#F2CC32] font-bold text-[1.5rem] mr-1">#5:</span> Run the game jam!
			</div>
		</div>
	</div>

	<img src="/clouds-pink-left.png" alt="" class="absolute left-0 w-5/12 bottom-0 translate-y-32 z-50 pointer-events-none">
	<img src="/clouds-pink-right.png" alt="" class="absolute right-0 w-5/12 bottom-0 translate-y-32 z-50 pointer-events-none">

	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-size-[100vw_100vh] bg-repeat mix-blend-overlay opacity-60 pointer-events-none bg-position-[0_100vh]"></div>
</div>

<div class="w-full bg-gradient-to-b from-[#FDC5D1] to-[#FAE3C9] items-center justify-center px-32 relative pt-36">
	<div class="max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2 max-md:z-100">
		<div class="relative w-full max-w-3xl mx-auto min-w-72 max-md:mx-0">
			<img src="banner.png" alt="100 Cities Worldwide" class="absolute top-0 left-1/2 -translate-x-1/2 max-md:-translate-y-1/2 z-100 h-48 w-auto z-10 scale-150 saturate-70 brightness-110 object-contain px-4">
			<img src="hole.png" alt="" class="w-full h-full max-w-3xl">
			<iframe 
				src="https://felt.com/embed/map/Daydream-Events-pPFQnT34SOq6tYlb2S1IdC?loc=0%2C-73.3%2C1.7z&legend=0&cooperativeGestures=1&link=0&geolocation=0&zoomControls=1&scaleBar=0" 
				class="absolute top-0 left-0 w-full h-full border-0"
				style="mask: url('hole.png') no-repeat center; -webkit-mask: url('hole.png') no-repeat center; mask-size: contain; -webkit-mask-size: contain;"
				title="Felt Map"
				referrerpolicy="strict-origin-when-cross-origin">
			</iframe>
			<p class="absolute left-1/2 -translate-x-1/2 font-sans text-center text-2xl pt-12 w-max max-w-[80vh] max-md:max-w-full md:px-12 text-[#60574b] z-10000 ">All daydream events are organized by high school students like yourself! <br> <span class="font-bold"><a class="underline hover:text-pink" href="https://forms.hackclub.com/daydream">Sign up</a> to organize now!</span></p>
		</div>
	</div>
	<div class="max-md:h-96"></div>
	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>
</div>

<div class="w-full pb-24 max-md:pt-16 bg-gradient-to-b from-[#FAE3C9] to-[#e99cce] relative flex flex-col items-center justify-center">
	<img src="faq-clouds.png" alt="" class="w-full">
	<img src="faq.png" alt="FAQ" class="mb-12 h-24 scale-175 max-md:scale-120">

	<!-- FAQ Grid -->
	<div class="grid grid-cols-2 gap-8 max-w-6xl px-8 z-10 max-md:grid-cols-1">
		<!-- FAQ Item 1 -->
		<div class="relative transform -rotate-2">
			<img src="window-3.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24 opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">Who can participate in Daydream?</h3>
				<p class="text-sm max-md:text-xs">All high-school & upper-middle-school aged students are welcome to come!</p>
			</div>
		</div>

		<!-- FAQ Item 2 -->
		<div class="relative transform rotate-1">
			<img src="window-4.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24 opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">Can I organize a Daydream in my city?</h3>
				<p class="text-sm max-md:text-xs">Definitely! Contact us via daydream@hackclub.com or join #daydream on slack.</p>
			</div>
		</div>

		<!-- FAQ Item 3 -->
		<div class="relative transform rotate-2">
			<img src="window-2.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24  opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">All this, for free?</h3>
				<p class="text-sm max-md:text-xs">Yep! Food, swag and good vibes are all included. Plus, if you're joining us from afar, we'll cover the cost of gas or a bus / train ticket.</p>
			</div>
		</div>

		<!-- FAQ Item 4 -->
		<div class="relative transform -rotate-1">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24  opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">What do I need?</h3>
				<p class="text-sm max-md:text-xs">Your laptop, chargers, toiletries, sleeping bags, and an open mind!</p>
			</div>
		</div>

		<!-- FAQ Item 5 -->
		<div class="relative transform rotate-1">
			<img src="window-4.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24 opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">What has Hack Club done before?</h3>
				<p class="text-sm max-md:text-xs">Hack Club has run an overnight hackathon in San Francisco, a Game Jam across 50 cities, a hackathon on a train from Vermont to Los Angeles, and much more!</p>
			</div>
		</div>

		<!-- FAQ Item 6 -->
		<div class="relative transform rotate-1">
			<img src="window-3.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24 opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">I'm not good at coding. Can I still participate?</h3>
				<p class="text-sm max-md:text-xs">This game jam is for all skill levels! We'll have workshops and other events so join us and let's learn together.</p>
			</div>
		</div>

		<!-- FAQ Item 7 -->
		<div class="relative transform -rotate-2">
			<img src="window-2.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24 opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">What if my parents are concerned?</h3>
				<p class="text-sm max-md:text-xs">We're here to help! You can see our parent guide here, or they can reach out to us at daydream@hackclub.com for questions.</p>
			</div>
		</div>

		<!-- FAQ Item 8 -->
		<div class="relative transform -rotate-1">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain max-md:scale-130">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24 opacity-70 max-lg:px-18 max-md:px-2">
				<h3 class="text-xl font-serif font-bold mb-4 max-md:mb-1 max-md:text-lg">What can I make at Daydream?</h3>
				<p class="text-sm max-md:text-xs">ANY type of game based on the theme! Platformer, visual novel, clicker game, etc. Be as creative as possible!</p>
			</div>
		</div>
	</div>

	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>
</div>

<div class="w-full bg-[#FFFFF8] relative -z-10 min-h-80">
	<div class="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] bg-repeat opacity-10 pointer-events-none z-0"></div>
	<div class="absolute w-full h-32 bg-[url('brushstroking.png')] bg-repeat-x z-10 bg-size-[100vw_100vh] mix-blend-overlay -translate-0.5" style="mask-image: url(/footer-clouds.png); mask-size: contain; mask-repeat: repeat-x; -webkit-mask-image: url(/footer-clouds.png); -webkit-mask-size: contain; -webkit-mask-repeat: repeat-x;"></div>
	<div class="w-full h-32 bg-[#e99cce] z-5" style="mask-image: url(/footer-clouds.png); mask-size: contain; mask-repeat: repeat-x; -webkit-mask-image: url(/footer-clouds.png); -webkit-mask-size: contain; -webkit-mask-repeat: repeat-x;"></div>

	<!-- Footer Text -->
	<div class="absolute bottom-20 left-32 text-center z-20">
		<p class="text-gray-700 mb-2">Made with ♡ by teenagers, for teenagers at Hack Club</p>
		<div class="flex space-x-4">
			<a href="https://hackclub.com" class="text-gray-700 hover:text-gray-900 transition-colors">Hack Club</a>
			<span class="text-gray-700">・</span>
			<a href="https://hackclub.com/slack" class="text-gray-700 hover:text-gray-900 transition-colors">Slack</a>
			<span class="text-gray-700">・</span>
			<a href="https://hackclub.com/clubs" class="text-gray-700 hover:text-gray-900 transition-colors">Clubs</a>
			<span class="text-gray-700">・</span>
			<a href="https://hackclub.com/hackathons" class="text-gray-700 hover:text-gray-900 transition-colors">Hackathons</a>
		</div>
	</div>

	<div class="absolute bottom-2 right-16 h-2/3 aspect-square bg-[url('brushstroking.png')] bg-repeat z-10 bg-size-[100vw_100vh] mix-blend-overlay" style="mask-image: url(/thought-bubbles.png); mask-size: contain; mask-repeat: no-repeat; -webkit-mask-image: url(/thought-bubbles.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat;"></div>
	<div class="absolute bottom-2 right-16 h-2/3 aspect-square bg-[#e99cce]" style="mask-image: url(/thought-bubbles.png); mask-size: contain; mask-repeat: no-repeat; -webkit-mask-image: url(/thought-bubbles.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat;"></div>
</div>

<!-- Video Popup Modal -->
{#if showVideoPopup}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 bg-[rgba(0,0,0,0.5)] bg-opacity-70 flex items-center justify-center z-50"
		on:click={closeVideoPopup}
		on:keydown={(e) => e.key === 'Escape' && closeVideoPopup()}
		role="dialog"
		aria-modal="true"
		aria-label="Video popup"
		tabindex="-1"
	>
		<button
			class="cursor-pointer absolute top-4 right-4 z-10 w-8 h-8 bg-[rgba(255,255,255,0.2)] hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-xl font-bold transition-colors duration-200"
			on:click={closeVideoPopup}
			aria-label="Close video"
		>
		<span class="-translate-y-0.5">×</span>
		</button>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative w-[90vw] h-[90vh] max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden"
			on:click|stopPropagation
		>
			<iframe
				src="https://www.youtube.com/embed/O44y8TeJrNE?autoplay=1"
				title="YouTube video player"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen
				class="w-full h-full"
			></iframe>
		</div>
	</div>
{/if}

<!-- Hidden form for newsletter signup -->
<form
	id="hidden-signup-form"
	method="post"
	action="https://app.loops.so/api/newsletter-form/clo3frr4v02f3jv0qqu6hgfqs"
	target="hidden-iframe"
	style="display: none;"
>
	<input type="email" name="email" required>
	<input type="hidden" name="mailingLists" value="cmd3c94kz0hvz0iwt7ps28cyd">
	<button type="submit">Sign up</button>
</form>

<!-- Hidden iframe to receive form submission -->
<iframe name="hidden-iframe" style="display: none;"></iframe>