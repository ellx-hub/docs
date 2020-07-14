<script>
  export let value = 10;
</script>

<style>
  input {
    font-color: black;
  }
</style>

<input class="cursor-pointer" type="range" bind:value min=0 max=100>