<script setup lang="ts">
import { ref } from 'vue'
import AiChat from '@/components/AiChat.vue'
import AiImage from '@/components/AiImage.vue'

const currentIndex = ref(0)
</script>

<template>
  <AiChat v-show="currentIndex === 0" />
  <AiImage v-show="currentIndex === 1" />
  <!-- tabbar，短期不用管了，就这样 -->
  <view class="tabbar fixed flex aic jcsb">
    <view class="tabbar-item flex-c aic jcc" @click="currentIndex = 0">
      <image :src="`/static/icons/chat${currentIndex === 0 ? '' : '-disabled'}.png`" mode="aspectFit"></image>
      <text>对话</text>
    </view>
    <view class="tabbar-item flex-c aic jcc" @click="currentIndex = 1">
      <image :src="`/static/icons/image${currentIndex === 1 ? '' : '-disabled'}.png`" mode="aspectFit"></image>
      <text>图片</text>
    </view>
  </view>
</template>

<style scoped>
.tabbar {
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 60%;
  max-width: 100%;
  height: 80px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px 40px;
  border-radius: 40px;
}

.tabbar-item image {
  width: 48px;
  height: 48px;
}
</style>
