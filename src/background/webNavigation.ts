import { Action, Message } from '@/utils'

Message.background.on(
  Action.Background.InstallWidget,
  (message, sender, sendResponse) => {
    const { widgetData } = message

    chrome.tabs.query({}, function (tabs) {
      tabs.some(tab => {
        if (tab.url === 'chrome://newtab/') {
          Message.newtab.send(tab.id!, {
            action: Action.Newtab.CreateWidget,
            widgetData,
          })
          return true
        }
      })
    })

    sendResponse()
  }
)

chrome.webNavigation.onCompleted.addListener(details => {
  if (details.url.startsWith('http://localhost:3000')) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: (Background: typeof Action.Background) => {
        /** 在网页环境，无法直接向 chrome扩展 发送消息，所以由 window message 转发 */
        window.addEventListener('message', e => {
          const { action, widgetData } = e.data

          if (action === Background.InstallWidget) {
            /** 向 backgorund 的 chrome.runtime.message 发送消息 */
            chrome.runtime.sendMessage({ action, widgetData })
          }
        })
      },
      args: [Action.Background],
    })
  }
})
