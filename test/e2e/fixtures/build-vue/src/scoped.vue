<template>
  <div class="scoped"></div>
</template>

<script>
import styles from './styles/scoped.module.less'

export default {
  name: 'scoped',
  setup() {
    console.log(styles.text)
    return {
      test: styles?.test
    }
  }
}
</script>

<style lang="less" scoped>
@green: green;
.scoped {
  padding: 30px;
  color: @green;
}
</style>
