<template>
  <div :class="$style.module">{{ text }} --- {{ textundefind }}</div>
</template>
<script lang="ts">
import './styles/scoped.less'
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'module',
  setup() {
    const a: any = {
      text: 'text'
    }
    return {
      text: a?.text,
      textundefind: a?.textundefind
    }
  }
})
</script>
<style lang="less" module>
@green: green;
.module {
  padding: 30px;
  color: @green;
}
</style>
