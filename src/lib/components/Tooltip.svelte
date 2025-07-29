<script lang="ts">
  export let content: string;
  
  let showTooltip = false;
  let hoverTimeout: NodeJS.Timeout;
  
  function handleMouseEnter() {
    clearTimeout(hoverTimeout);
    showTooltip = true;
  }
  
  function handleMouseLeave() {
    hoverTimeout = setTimeout(() => {
      showTooltip = false;
    }, 100);
  }
</script>

<div class="relative inline-block">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <span 
    class="cursor-help"
    style="border-bottom: 2px dotted #9ca3af;"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    <slot />
  </span>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 transition-opacity duration-200 ease-in-out"
    class:opacity-0={!showTooltip}
    class:opacity-100={showTooltip}
    class:pointer-events-auto={showTooltip}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
  >
    <div class="bg-black text-white text-sm rounded px-3 py-2 whitespace-nowrap shadow-lg">
      {@html content}
    </div>
    <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
  </div>
</div>
