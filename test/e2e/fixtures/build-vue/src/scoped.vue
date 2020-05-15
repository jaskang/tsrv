<template>
  <div class="scoped"></div>
</template>
<script lang="typescript">
export default {
name: 'scoped'
}
</script>
<style lang="less" scoped>
@green: green;
.scoped {
  padding: 30px;
  color: @green;
}
</style>
