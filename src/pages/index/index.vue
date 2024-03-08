<script lang="ts" setup>
import { ref, nextTick } from 'vue'
import type { Ref } from 'vue'
import { onCompletions } from '@/services/llm'
import AiHeader from '@/components/common/AiHeader.vue'

// 对话模块
const lastContent = ref('')
const listBox: Ref<HTMLDivElement | undefined> = ref()

type ChatList = GLMMessage[]

const chatContent = ref('')
const chatList: Ref<ChatList> = ref([])
const isChating = ref(false)

const onCreateChat = (content: string, role: GLMMessage["role"]) => {
  chatList.value.push({ content, role })
  onScrollToBottom()
}

const onChat = async () => {
  const lastChat = chatList.value.at(-1)
  if (lastChat && !isChating.value) {
    try {
      isChating.value = true
      await onCompletions(chatList.value, (result) => {
        lastContent.value = result
        onScrollToBottom()
      }, done => {
        if (done) {
          isChating.value = false
          onCreateChat(lastContent.value, 'assistant')
          lastContent.value = ''
        }
      })
    } catch (error) {
      isChating.value = false
      chatList.value.pop()
      console.error(error)
    }
  }
}

const onSend = (e: KeyboardEvent | MouseEvent) => {
  const content = chatContent.value!.trim()
  if (content) {
    onCleanTextarea()
    onCreateChat(content, 'user')
    onChat()
  }
}

const onCleanTextarea = () => {
  chatContent.value = ''
}

const onScrollToBottom = () => {
  nextTick(() => {
    uni.pageScrollTo({
      scrollTop: 1000000,
      duration: 100
    })
  })
}
</script>

<template>
  <AiHeader></AiHeader>
  <view class="chat-list-box" ref="listBox">
    <view class="chat chat-start flex">
      <view class="chat-bubble chat-bubble-accent">你好啊，有什么需要帮助的么？</view>
    </view>
    <view v-for="(chat, index) of chatList" :key="`chat${index}`" class="chat flex chat-start"
      :class="chat.role === 'assistant' ? 'chat-start' : 'chat-end'">
      <view class="chat-bubble" :class="chat.role === 'assistant' ? 'chat-bubble-accent' : 'chat-bubble-info'">{{
      chat.content }}</view>
    </view>
    <view v-show="lastContent" class="chat chat-start">
      <view class="chat-bubble chat-bubble-accent">{{ lastContent }}</view>
    </view>
  </view>
  <view class="chat-input-box flex jcsb aic fixed">
    <textarea class="f1" :placeholder="isChating ? '请等待 AI 输出完成' : '请描述您的需求'" :disabled="isChating"
      v-model="chatContent" confirm-type="send" @confirm="onSend"></textarea>
    <view @click="onSend">send</view>
  </view>
</template>

<style scoped>
.chat-box {
  width: 100%;
  height: 100%;
  background-color: white;
  padding-top: 80px;
}

.chat {
  margin-bottom: 20px;
}

.chat-end {
  justify-content: flex-end;
}

.chat-start .chat-bubble {
  border-bottom-left-radius: 0;
}

.chat-end .chat-bubble {
  border-bottom-right-radius: 0;
}

.chat-bubble {
  position: relative;
  display: block;
  width: fit-content;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  max-width: 90%;
  border-radius: var(--rounded-box, 1rem);
  min-height: 2.75rem;
  min-width: 2.75rem;
}

.chat-bubble-accent {
  background-color: #00D7C0;
}

.chat-bubble-info {
  background-color: #00B5FF;
}

.chat-list-box {
  margin: 100px 0 180px;
}

.chat-input-box {
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
}

textarea {
  height: 80px;
  border: none;
  outline: none;
  padding: 10px;
  margin: 10px 10px 80px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.send-button {
  width: 64px;
  height: 32px;
  border-radius: 8px;
  color: white;
  font-weight: 800;
  background-color: #4A00FF;
}
</style>