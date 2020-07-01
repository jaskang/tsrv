import { defineComponent } from 'vue'
const TestTeleport = defineComponent({
  inheritRef: true,
  setup(props, { slots }) {
    return () => (
      <>
        <teleport to={'123'}>
          <div>
            {/* <div v-if="title" class="el-popover__title" v-text="title"></div> */}
            {slots.default()}
          </div>
          <div class="popper__arrow" data-popper-arrow></div>
        </teleport>
      </>
    )
  }
})

export default TestTeleport
