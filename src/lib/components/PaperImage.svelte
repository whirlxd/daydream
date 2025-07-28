<script lang="ts">
  export let src: string;
  export let alt: string = '';
</script>

<div class="paper-wrapper">
  <img {src} {alt} />
</div>

<style>
  .paper-wrapper {
    background: white;
    background-clip: padding-box;
    border-image: url('/guide/paper-border.png') 35 stretch;
    border-width: 35px;
    border-style: solid;
    display: inline-block;
  }
  
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0;
  }
</style>
