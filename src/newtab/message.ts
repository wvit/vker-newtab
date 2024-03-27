import { storeHandles, objectHandles } from '@/utils/store'
import { Action, Message, Dom } from '@/utils'

/** 获取小部件列表 */
Message.newtab.on(
  Action.Newtab.GetWidgetList,
  async (message, sender, sendResponse) => {
    const { list } = await storeHandles.widget.getAll()
    sendResponse(list)
  }
)

/** 创建添加一个小部件 */
Message.newtab.on(
  Action.Newtab.CreateWidget,
  async (message, sender, sendResponse) => {
    const { widgetData } = message
    const result = await storeHandles.widget.detail(widgetData.id)

    if (result) {
      await storeHandles.widget.delete(widgetData.id)
    }
    await storeHandles.widget.create(widgetData)

    sendResponse(true)
  }
)

/** 更新小部件数据 */
Message.newtab.on(
  Action.Newtab.UpdateWidget,
  async (message, sender, sendResponse) => {
    const { widgetData } = message
    const result = await storeHandles.widget.update(widgetData)

    sendResponse(result)
  }
)

/** 移除小部件 */
Message.newtab.on(
  Action.Newtab.DeleteWidget,
  async (message, sender, sendResponse) => {
    const { widgetData } = message
    const result = await storeHandles.widget.delete(widgetData.id)

    sendResponse(result)
  }
)

/** 监听 http 请求转发 message */
Message.window.on(Action.Window.HttpRequest, async e => {
  const { forward, sandboxId, requestData, callbackData } = e.data
  const { method, url, headers: requestHeaders, body } = requestData || {}
  const res = await fetch(url, {
    method,
    body,
    headers: requestHeaders,
  })
  const { status, statusText, headers } = res
  const responseHeaders = Array.from(headers.keys()).reduce((prev, key) => {
    return { ...prev, [key]: headers.get(key) }
  }, {})

  const resultData = {
    ...callbackData,
    responseData: {
      status,
      statusText,
      responseText: await res.text(),
      headers: responseHeaders,
    },
  }

  Message.window.send(
    Dom.query(`#${sandboxId}`).contentWindow,
    forward
      ? {
          action: Action.Window.Forward,
          forwardData: resultData,
        }
      : { ...resultData }
  )
})

/** 设置 newtab 页面背景 */
Message.window.on(Action.Window.SetBackground, e => {
  const { backgroundUrl } = e.data
  objectHandles.globalConfig.set({ backgroundUrl })
})
