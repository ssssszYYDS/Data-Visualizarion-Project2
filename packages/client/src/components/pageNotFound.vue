<template>
  <div class="page-not-found-wrapper">
    Page not Find !!!
  </div>
</template>
<script>
import { onMounted } from 'vue';

export default {
    setup() {
        onMounted(()=>{
            if (window.location.host.indexOf('localhost') === -1) {
                window.location.href = "/404";
            }
        });
    }
};
</script>
<style lang="less" scoped>
    .page-not-found-wrapper{
        text-align: center;
        margin-top: 5rem;
    }
</style>