import request from '@/utils/request'

//测试后台异步处理任务
export function testProcess() {
    return request({
        url: '/ai/testAsyncProcess',
        method: 'post'
    })
}

//获取历史消息
export function getHistoryMessage(query) {
    return request({
        url: '/ai/getHistoryMessage',
        method: 'get',
        params: query
    })
}

//获取所有历史消息列表
export function getAllHistoryMessage(query) {
    return request({
        url: '/ai/getAllHistoryMessage',
        method: 'get',
        params: query
    })
}

//根据redisKey获取一次聊天消息列表
export function getOneHistoryMessage(query) {
    return request({
        url: '/ai/getOneHistoryMessage',
        method: 'get',
        params: query
    })
}

//根据redisKey删除一条历史消息
export function deleteOneHistoryMessage(query) {
    return request({
        url: '/ai/deleteHistoryMessage',
        method: 'get',
        params: query
    })
}

//根据redisKey删除一条历史消息
export function deleteOneRedisChat(query) {
    return request({
        url: '/ai/deleteRedisChat',
        method: 'get',
        params: query
    })
}

//刷新redis缓存
export function refreshRedisChat(query) {
    return request({
        url: '/ai/reGetRedisChat',
        method: 'get',
        params: query
    })
}

//调用Google Gemini AI的接口
export function geminiAI(data) {
    return request({
        url: '/ai/getGeminiContent',
        method: 'post',
        data: data
    })
}

//调用Google Gemini AI的接口,采用对话模式
export function geminiAIChat(data) {
    return request({
        url: '/ai/getGeminiChat',
        method: 'post',
        data: data
    })
}

//调用Google Gemini AI的接口,采用对话模式
export function geminiAIWithFile(data) {
    return request({
        url: '/ai/getGeminiWithFile',
        method: 'post',
        data: data,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

//上传录音文件
export function uploadVoiceBlob(data) {
    return request({
        url: '/ai/uploadVoiceBlob',
        method: 'post',
        data: data,
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

//TTS 文字转语音
export function downLoadZip(requestUrl, filename) {
    var url = baseUrl + requestUrl
    axios({
        method: 'get',
        url: url,
        // params:queryParams,
        responseType: 'blob',
        headers: { 'Plus-Token': getToken() } //'Bearer ' +
    }).then(res => {
        resolveBlob(res, mimeMap.zip)
    })
}

//tts文字转语音
export function getGeminiTTS(data) {
    return request({
        url: '/ai/gemini_preview_tts',
        method: 'post',
        data
    })
}

export function getTTSChinese(query) {
    return request({
        url: '/translate/ttsZH_CN',
        method: 'get',
        params: query
    })
}

export function geminiStreamChat(prompt){
  return fetch(process.env.VUE_APP_BASE_API+'/ai/chat/stream', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream"// 重要：声明前端接受 SSE 数据
    },
    body: JSON.stringify(prompt)
  });
}

/** 通用 AI 请求（GET/POST 实测，previewOnly 可只预览 URL+Key） */
export function genericAiRequest(data) {
  return request({
    url: '/ai/generic/request',
    method: 'post',
    data,
    timeout: 90000
  })
}

/** 通用聊天（走 AiService 自动选 gemini/chatgpt） */
export function genericAiChat(data) {
  return request({
    url: '/ai/generic/chat',
    method: 'post',
    data,
    timeout: 90000
  })
}
