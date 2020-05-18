<template>
  <div :class="$style.module"></div>
</template>
<script lang="typescript">
import './styles/scoped.less'

export default {
name: 'module'
}
</script>
<style lang="less" module>
@green: green;
.module {
  padding: 30px;
  color: @green;
}
</style>
