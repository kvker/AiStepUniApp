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
      // 用一个事件循环搞定打字机
      let haveDone = false
      let loop: Function[] = []
      const run = () => {
        setTimeout(() => {
          const task = loop.shift()
          task && task()
          if (!task && haveDone) {
            console.log('结束')
          } else {
            run()
          }
        }, 50)
      }
      run()
      await onCompletions(chatList.value, (text) => {
        text.split('').forEach(i => {
          loop.push(() => {
            lastContent.value += i
            onScrollToBottom()
          })
        })
      }, done => {
        if (done) {
          loop.push(() => {
            isChating.value = false
            onCreateChat(lastContent.value, 'assistant')
            lastContent.value = ''
          })
          haveDone = true
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

const isDev = process.env.NODE_ENV === 'development'
</script>

<template>
  <text>这是绘画</text>
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
  padding: 100px 10px 180px;
}

.chat-input-box {
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px 0 80px;
}

textarea {
  height: 80px;
  border: none;
  outline: none;
  padding: 10px;
  margin: 0 10px 0;
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