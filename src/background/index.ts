import { Action, Message, getNewtabs, sleep, local } from '@/utils'

/** 更新小部件版本数据 */
const updateWidgetVersion = async () => {
  const newtab = (await getNewtabs())[0]
  if (!newtab) return
  const widgetList = await Message.newtab.send(newtab.id, {
    action: Action.Newtab.GetWidgetList,
  })
  const widgetVersionMap = widgetList.reduce((prev, item) => {
    return { ...prev, [item.id]: item.version || '' }
  }, {})

  await local.set({ widgetVersionMap })
}

/** 发送小部件版本数据 */
const sendWidgetVersion = async sendResponse => {
  await updateWidgetVersion()

  /** 向 window 响应小部件版本数据 */
  sendResponse({
    action: Action.Window.WidgetVersionResponse,
    widgetVersionData: await local.get('widgetVersionMap'),
  })
}

/** 监听通知安装小部件事件 */
Message.background.on(
  Action.Background.InstallWidget,
  async (message, sender, sendResponse) => {
    const { widgetData } = message
    const newtab = (await getNewtabs())[0]

    if (newtab) {
      await Message.newtab.send(newtab.id, {
        action: Action.Newtab.CreateWidget,
        widgetData,
      })
    }

    sendWidgetVersion(sendResponse)
  }
)

/** 监听通知卸载小部件事件 */
Message.background.on(
  Action.Background.UninstallWidget,
  async (message, sender, sendResponse) => {
    const { widgetData } = message
    const newtab = (await getNewtabs())[0]

    if (newtab) {
      await Message.newtab.send(newtab.id, {
        action: Action.Newtab.DeleteWidget,
        widgetData,
      })
    }

    sendWidgetVersion(sendResponse)
  }
)

/** 监听获取小部件版本 message */
Message.background.on(
  Action.Background.GetWidgetVersion,
  async (message, sender, sendResponse) => {
    sendWidgetVersion(sendResponse)
  }
)

/** 获取已安装的小部件版本 */
chrome.tabs.onActivated.addListener(async () => {
  await sleep(500)
  updateWidgetVersion()
})

/** 监听打开的新页面标签 */
chrome.webNavigation.onCompleted.addListener(details => {
  const { url } = details

  if (
    url.startsWith('http://localhost:3000') ||
    url.startsWith('http://124.220.171.110:3000')
  ) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: Action => {
        /** 在网页环境，无法直接向 chrome扩展 发送消息，所以由 window message 转发 */
        window.addEventListener('message', e => {
          const { action, forwardData } = e.data

          if (action === Action.Window.Forward) {
            /** 向 backgorund 的 chrome.runtime.message 发送消息 */
            chrome.runtime.sendMessage(forwardData, message => {
              /** 向当前页面 window 响应来自 background 的数据 */
              if (message) window.postMessage(message, '*')
            })
          }
        })
      },
      args: [Action],
    })
  }
})
