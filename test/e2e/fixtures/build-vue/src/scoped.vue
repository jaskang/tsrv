<template>
  <div class="scoped"></div>
</template>
<script lang="ts">
import styles from './styles/scoped.module.less'
console.log(styles.text)

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
