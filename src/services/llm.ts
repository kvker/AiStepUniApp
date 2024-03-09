import { faasChatUrl } from '@/services/config'

type GlmResponseJson = { "id": string, "created": number, "model": string, "choices": { "index": number, "finish_reason"?: "stop", "delta": { "role": "assistant", "content": string } }[], "usage"?: { "prompt_tokens": number, "completion_tokens": number, "total_tokens": number } }

type LlmCb = (result: string) => void

export async function onCompletions(content: string | GLMMessage[], SseCB: LlmCb, doneCb?: LlmCb, errorCb?: LlmCb) {
  let messages = []
  if (content instanceof Array) {
    messages = content
  } else {
    messages = [{ content, role: 'user' }] as GLMMessage[]
  }
  const requestTask: any = wx.request({
    url: 'https://1251835910-csx8mv01a0-bj.scf.tencentcs.com/api/sse',
    method: 'POST',
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Accept": 'text/event-stream',
      "Transfer-Encoding": 'chunked',
    },
    timeout: 50000,
    responseType: 'text',
    enableChunked: true,
    data: {
      messages,
    },
    fail: (error: any) => {
      errorCb && errorCb(error.message || error.errMsg || error)
    }
  })
  let text = ''
  let tempText = '' // 临时存储一节无法parse的字符串, 追加到可以parse为止
  let resultText = ''
  let parseRet = { jsonList: [] as GlmResponseJson[], tempText: '', done: false }
  requestTask.onChunkReceived(async (response: any) => {
    const arrayBuffer = response.data
    // console.log(arrayBuffer)
    // @ts-ignore
    const encodedString = String.fromCharCode.apply(null, arrayBuffer)
    text = decodeURIComponent(escape(encodedString))
    parseRet = onParseGlmStreamChunkJsons2JsonList(text, tempText)
    tempText = parseRet.tempText
    const done = parseRet.done
    for (const json of parseRet.jsonList) {
      content = json.choices[0].delta.content
      if (content.trim()) {
        resultText += content
        // console.log(resultText)
        SseCB && SseCB(content)
      }
    }
    if (done) {
      console.log('done!!!')
      doneCb && doneCb(resultText)
    }
  })
}

/**
 * 对 GLM 返回的 Stream 且是 JSON 的字符串处理
 * @param text 待处理的字符
 * @param tempText 上次未能 parse 的尾部字符
 * @returns {jsonList, tempText} 其中的 tempText 是未能parse的字符串, 需要追加到下一次parse
 */
function onParseGlmStreamChunkJsons2JsonList(text: string, tempText: string): { jsonList: GlmResponseJson[], tempText: string, done: boolean } {
  let json: GlmResponseJson
  let jsonList: GlmResponseJson[] = []
  let textList = text.split('\n\n')
  let done = false
  for (text of textList) {
    if (!text.trim()) continue
    if (text.includes('data: [DONE]')) {
      console.log(text)
      done = true
      break
    }
    text = (tempText + text).replace(/data:\s|\[DONE\]/g, '')
    try {
      json = JSON.parse(text) as GlmResponseJson
      jsonList.push(json)
      tempText = ''
    } catch (error) {
      tempText += text
    }
  }
  return { jsonList, tempText, done }
}