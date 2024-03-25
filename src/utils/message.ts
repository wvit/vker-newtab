/** 发送消息数据类型 */
type MessageType<T extends Action.Background | Action.Newtab | Action.Window> =
  {
    action: T
    [key: string]: any
  }

/** 区分 chrome.runtime.message 的 action 操作类型*/
export namespace Action {
  export enum Background {
    /** 安装应用 */
    InstallWidget = 'installWidget',
  }

  export enum Newtab {
    /** 获取小部件列表 */
    GetWidgetList = 'getWidgetList',
    /** 新创建一个小部件 */
    CreateWidget = 'createWidget',
    /** 更新小部件数据 */
    UpdateWidget = 'updateWidget',
  }

  export enum Window {
    /** 转发 http 请求 */
    HttpRequest = 'httpRequest',
    /** 转发 http 请求后的响应 */
    HttpResponse = 'httpResponse',
    /** 转发 message 信息 */
    Forward = 'forward',
    /** 通知加载 sandbox 内容 */
    LoadSandbox = 'loadSandbox',
    /** 加载 sandbox 的响应 */
    LoadSandboxResponse = 'loadSandboxResponse',
  }
}

/** 方便区分消息的走向，因为在 chrome 扩展中，有 background newtab content action 等多个环境。 */
export const Message = {
  newtab: {
    /** 向指定 newtab 页面发送 message */
    send: (tabId: number, message: MessageType<Action.Newtab>) => {
      return new Promise<any>(resolve => {
        chrome.tabs.sendMessage(tabId, message, resolve)
      })
    },

    /** 向当前选中的 newtab 页面发送 message */
    activeSend: (message: MessageType<Action.Newtab>) => {
      return new Promise<any>(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          if (!tabs[0]?.id) return
          chrome.tabs.sendMessage(tabs[0].id, message, resolve)
        })
      })
    },

    /** 监听向 newtab 页面发送的 message 事件 */
    on: (
      action: Action.Newtab,
      callback: (
        message: MessageType<Action.Newtab>,
        sender: any,
        sendResponse: (data?: any) => void
      ) => void
    ) => {
      chrome.runtime.onMessage.addListener(
        (message: MessageType<Action.Newtab>, sender, sendResponse) => {
          if (action === message.action) {
            callback?.(message, sender, sendResponse)
            /** 返回 true，告诉chrome.runtime， 这个 sendResponse 会后续响应 */
            return true
          }
        }
      )
    },
  },

  background: {
    /** 向 background 发送消息 */
    send: (message: MessageType<Action.Background>) => {
      return new Promise<any>(resolve => {
        chrome.runtime.sendMessage(message, resolve)
      })
    },

    /** 监听向 background 发送的 message 事件 */
    on: (
      action: Action.Background,
      callback: (
        message: MessageType<Action.Background>,
        sender: any,
        sendResponse: (data?: any) => void
      ) => void
    ) => {
      chrome.runtime.onMessage.addListener(
        (message: MessageType<Action.Background>, sender, sendResponse) => {
          if (action === message.action) {
            callback?.(message, sender, sendResponse)
            return true
          }
        }
      )
    },
  },

  window: {
    /** 向 window 之间发送信息 */
    send: (target: Window, message: MessageType<Action.Window>) => {
      target.postMessage(message, '*')
    },

    /** 监听 window 之间的通信 */
    on: <T extends MessageType<Action.Window>>(
      action: Action.Window,
      callback: (event: MessageEvent<T>) => void
    ) => {
      window.addEventListener('message', (e: MessageEvent<T>) => {
        if (action === e.data.action) {
          callback?.(e)
        }
      })
    },
  },
}
