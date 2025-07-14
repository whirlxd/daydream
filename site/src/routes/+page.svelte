<script lang="ts">
	import { onMount } from "svelte";
	import Lenis from "lenis";

	function createSmoothPath(points: Array<{ x: number; y: number }>) {
		if (points.length < 2) return "";
		
		// Create smooth curves that flow horizontally through points
		const tension = 1.2; // Increased control point distance for smoother curves
		
		// Configurable angles for each point (in degrees)
		// 0 = horizontal, positive = upward slope, negative = downward slope
		const pointAngles = [-10, -10, -10, 0]; // Last point angle now configurable for approach slope
		
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
				// Last point - curve out to the right and approach from right-to-left
				const prev = points[i - 1];
				const distance = Math.sqrt(Math.pow(points[i].x - prev.x, 2) + Math.pow(points[i].y - prev.y, 2));
				
				// Create a wide curve that goes out to the right and comes back
				const controlDistance = distance * tension * 1.2; // Increased for wider curve
				
				// First control point - extend out to the right from the previous point's flow
				cp1 = { 
					x: points[i].x + controlDistance * 0.8	, // Go out to the right
					y: points[i].y - controlDistance * 0.2   // Slight upward curve
				};
				
				// Second control point - approach from the right at the specified angle
				// Force approach from right side regardless of angle
				const approachDistance = controlDistance * 0.6;
				cp2 = { 
					x: points[i].x + approachDistance, // Always approach from right
					y: points[i].y + Math.sin(angleRadians) * approachDistance // Apply angle to vertical component
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
		const pointAngles = [-10, -10, -10, 0];
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
				const controlDistance = distance * tension * 1.2;
				
				cp1 = { 
					x: points[i].x + controlDistance * 0.8, 
					y: points[i].y - controlDistance * 0.2
				};
				
				const approachDistance = controlDistance * 0.6;
				cp2 = { 
					x: points[i].x + approachDistance, 
					y: points[i].y + Math.sin(angleRadians) * approachDistance
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
		const points = [];
		for (let i = 1; i <= 4; i++) {
			const element = document.querySelector(`[data-point="${i}"]`);
			if (element) {
				const rect = element.getBoundingClientRect();
				points.push({
					x: rect.left + rect.width / 2 - containerRect.left,
					y: rect.top + rect.height / 2 - containerRect.top
				});
			}
		}
		
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
		const points = [];
		
		// Get points in order by data-point attribute
		for (let i = 1; i <= 4; i++) {
			const element = document.querySelector(`[data-point="${i}"]`);
			if (element) {
				const rect = element.getBoundingClientRect();
				points.push({
					x: rect.left + rect.width / 2 - containerRect.left,
					y: rect.top + rect.height / 2 - containerRect.top
				});
			}
		}
		
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

<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-size-[100vw_100vh] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>

<div class="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-b from-[#CCF4FD] to-[#9DACF2] bg-blend-overlay">

	<div class="absolute top-0 left-0 w-full h-full bg-[url(/buildings-back.png)] bg-no-repeat bg-contain pointer-events-none -translate-y-15"></div>
	<div class="absolute top-0 left-0 w-full h-full bg-[url(/buildings-front.png)] bg-no-repeat bg-contain pointer-events-none -translate-y-15"></div>
	<!-- brush texture clipped to buildings -->
	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat pointer-events-none opacity-100 -translate-y-15 bg-center mix-blend-overlay" style="mask-image: url('/buildings-top.png'); mask-size: contain; mask-repeat: no-repeat; mask-position: center top; -webkit-mask-image: url('/buildings-top.png'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center top;"></div>
	<div class="inline-block relative">
		<h2
			class="text-xl font-serif bg-gradient-to-b from-[#487DAB] to-[#3F709A] bg-clip-text text-transparent absolute left-[calc(50%+3rem)] -translate-x-1/2 bottom-8 italic"
		>
			September 24th & 25th
		</h2>
		<img src="daydream.png" alt="Daydream" class="h-40 mb-6" />
	</div>
	<div class="relative inline-block">
		<h3
			class="text-3xl italic font-serif bg-gradient-to-b from-[#487DAB] to-[#3F709A] bg-clip-text text-transparent"
		>
			The World's Biggest High School Game Jam
		</h3>
		<img
			src="underline.svg"
			alt=""
			class="absolute left-1/2 -translate-x-1/2 -mt-1 h-auto scale-115"
		/>
	</div>
	
	<div class="mt-8 flex flex-col items-center gap-3 z-10">
		<input
			type="email"
			placeholder="Enter Your Email Address"
			class="w-80 px-4 py-2 bg-white text-black rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-daydream font-sans"
		/>
		<button
			class="w-80 px-4 py-2 bg-daydream text-white rounded-full border border-gray-300 hover:bg-daydream-hover transition-colors font-sans font-bold cursor-pointer"
		>
			SIGN UP NOW
		</button>
	</div>

	<img src="hot-air-balloon.png" alt="" class="absolute w-1/8 right-32 bottom-40 z-20">
	<img src="hot-air-balloon.png" alt="" class="absolute w-1/12 left-36 bottom-81 z-20">

	<img src="/clouds-right.png" alt="" class="absolute right-0 w-7/12 -bottom-6">
	<img src="/clouds-left.png" alt="" class="absolute left-0 w-5/12 -bottom-4">
</div>

<div class="flex flex-row flex-wrap w-full h-auto bg-gradient-to-b from-[#9DACF2] to-[#FDC5D1] px-36 pb-50 relative" id="islands-container">
	<img src="/clouds-left-2.png" alt="" class="absolute left-0 w-3/12 top-12">
	<img src="/clouds-left-3.png" alt="" class="absolute left-0 w-2/12 bottom-32">
	<img src="/clouds-right-2.png" alt="" class="absolute right-0 w-3/12 bottom-0">

	<!-- SVG Path Overlay -->
	<svg class="absolute inset-0 w-full h-full pointer-events-none z-0" id="path-svg">
		<path id="dotted-path" stroke="rgba(255,255,255,0.3)" stroke-width="3" fill="none" stroke-dasharray="8,8" opacity="0.7"></path>
	</svg>

	<img src="paper-airplane.png" alt="Paper airplane" class="h-16 absolute z-5" id="paper-airplane">

	<div class="flex flex-col items-center w-max basis-1/2 z-10">
		<div class="relative translate-y-8">
			<img src="/letter-1-front.png" alt="" class="object-contain absolute -bottom-16 -left-13 w-28 h-28">
			<img src="/letter-1-back.png" alt="" class="object-contain absolute -bottom-16 -left-13 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="1">
				<span class="font-sans text-[#EEA7CA] font-bold text-[1.3rem] mr-1">#1:</span> Sign up for a Daydream event in your city
			</div>
		</div>
		<img src="/island-1.png" alt="" class="w-72 h-72 object-contain">
	</div>

	<div class="flex flex-col items-center w-max basis-1/2 translate-y-24 z-10">
		<div class="relative translate-y-24">
			<img src="/letter-2-front.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28">
			<img src="/letter-2-back.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="2">
				<span class="font-sans text-[#639DEB] font-bold text-[1.3rem] mr-1">#2:</span> Find a team of other teenagers at Daydream
			</div>
		</div>
		<img src="/island-3.png" alt="" class="w-86 h-86 object-contain">
	</div>
	<div class="flex flex-col items-center w-max basis-1/2 -translate-x-12 z-10">
		<div class="relative translate-y-8">
			<img src="/letter-3-front.png" alt="" class="object-contain absolute -bottom-18 left-24 w-28 h-28">
			<img src="/letter-3-back.png" alt="" class="object-contain absolute -bottom-18 left-24 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="3">
				<span class="font-sans text-[#AB68E2] font-bold text-[1.3rem] mr-1">#3:</span> Start building your game - <u>No experience needed</u>
			</div>
		</div>
		<img src="/island-2.png" alt="" class="w-72 h-72 object-contain">
	</div>
		<div class="flex flex-col items-center w-max basis-1/2 translate-y-30 z-10">
		<div class="relative translate-y-24">
			<img src="/letter-4-front.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28">
			<img src="/letter-4-back.png" alt="" class="object-contain absolute -bottom-16 -right-13 w-28 h-28 -z-10">
			<div class="bg-[#FFF5FA] border-2 border-[#AA8B83] rounded-2xl text-xl font-serif p-6 w-56 text-center" data-point="4">
				<span class="font-sans text-[#F2993E] font-bold text-[1.3rem] mr-1">#4:</span> Attend workshops or talk to one of our mentors for help
			</div>
		</div>
		<img src="/island-4.png" alt="" class="w-88 h-88 object-contain">
	</div>

	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-size-[100vw_100vh] bg-repeat mix-blend-overlay opacity-60 pointer-events-none bg-position-[0_100vh]"></div>
</div>

<div class="w-full bg-gradient-to-b from-[#FDC5D1] to-[#FAE3C9] items-center justify-center px-32 relative">
	<div class="relative w-full max-w-3xl mx-auto">
		<img src="hole.png" alt="" class="w-full h-full max-w-3xl">
		<iframe 
			src="https://hackclub.com/map/" 
			class="absolute top-0 left-0 w-full h-full border-0"
			style="mask: url('hole.png') no-repeat center; -webkit-mask: url('hole.png') no-repeat center; mask-size: contain; -webkit-mask-size: contain; pointer-events: none;"
			title="Map">
		</iframe>
	</div>
	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>
</div>

<div class="w-full py-24 bg-gradient-to-b from-[#FAE3C9] to-[#e99cce] relative flex flex-col items-center justify-center">
	<img src="faq-clouds.png" alt="" class="w-full">
	<h1 class="text-9xl font-serif bg-gradient-to-b from-[#487DAB] to-[#3F709A] bg-clip-text text-transparent mb-12">FAQ</h1>

	<!-- FAQ Grid -->
	<div class="grid grid-cols-2 gap-8 max-w-6xl px-8 z-10">
		<!-- FAQ Item 1 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">Who can participate in Daydream?</h3>
				<p class="text-sm">All high-school & upper-middle-school aged students are welcome to come!</p>
			</div>
		</div>

		<!-- FAQ Item 2 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">Can I organize a Daydream in my city?</h3>
				<p class="text-sm">Definitely! Contact us via daydream@hackclub.com or join #daydream on slack.</p>
			</div>
		</div>

		<!-- FAQ Item 3 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">All this, for free?</h3>
				<p class="text-sm">Yep! Food, swag and good vibes are all included. Plus, if you're joining us from afar, we'll cover the cost of gas or a bus / train ticket.</p>
			</div>
		</div>

		<!-- FAQ Item 4 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">What do I need?</h3>
				<p class="text-sm">Your laptop, chargers, toiletries, sleeping bags, and an open mind!</p>
			</div>
		</div>

		<!-- FAQ Item 5 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">What has Hack Club done before?</h3>
				<p class="text-sm">Hack Club has run an overnight hackathon in San Francisco, a Game Jam across 50 cities, a hackathon on a train from Vermont to Los Angeles, and much more!</p>
			</div>
		</div>

		<!-- FAQ Item 6 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">I'm not good at coding. Can I still participate?</h3>
				<p class="text-sm">This game jam is for all skill levels! We'll have workshops and other events so join us and let's learn together.</p>
			</div>
		</div>

		<!-- FAQ Item 7 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">What if my parents are concerned?</h3>
				<p class="text-sm">We're here to help! You can see our parent guide here, or they can reach out to us at daydream@hackclub.com for questions.</p>
			</div>
		</div>

		<!-- FAQ Item 8 -->
		<div class="relative">
			<img src="window-1.png" alt="window" class="w-full h-full object-contain">
			<div class="absolute top-20 left-12 right-12 bottom-16 flex flex-col items-center justify-center text-center px-24">
				<h3 class="text-xl font-serif font-bold mb-4">What can I make at Daydream?</h3>
				<p class="text-sm">ANY type of game based on the theme! Platformer, visual novel, clicker game, etc. Be as creative as possible!</p>
			</div>
		</div>
	</div>

	<div class="absolute top-0 left-0 w-full h-full bg-[url('brushstroking.png')] bg-repeat mix-blend-overlay opacity-60 pointer-events-none"></div>
</div>

<div class="w-full bg-white relative -z-10 min-h-80">
	<div class="absolute w-full h-32 bg-[url('brushstroking.png')] bg-repeat-x z-10 bg-size-[100vw_100vh] mix-blend-overlay -translate-0.5" style="mask-image: url(/footer-clouds.png); mask-size: contain; mask-repeat: repeat-x; -webkit-mask-image: url(/footer-clouds.png); -webkit-mask-size: contain; -webkit-mask-repeat: repeat-x;"></div>
	<div class="w-full h-32 bg-[#e99cce] z-5" style="mask-image: url(/footer-clouds.png); mask-size: contain; mask-repeat: repeat-x; -webkit-mask-image: url(/footer-clouds.png); -webkit-mask-size: contain; -webkit-mask-repeat: repeat-x;"></div>

	<div class="absolute bottom-2 right-16 h-2/3 aspect-square bg-[url('brushstroking.png')] bg-repeat z-10 bg-size-[100vw_100vh] mix-blend-overlay" style="mask-image: url(/thought-bubbles.png); mask-size: contain; mask-repeat: no-repeat; -webkit-mask-image: url(/thought-bubbles.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat;"></div>
	<div class="absolute bottom-2 right-16 h-2/3 aspect-square bg-[#e99cce]" style="mask-image: url(/thought-bubbles.png); mask-size: contain; mask-repeat: no-repeat; -webkit-mask-image: url(/thought-bubbles.png); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat;"></div>
</div>