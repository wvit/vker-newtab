import { storeHandles } from '@/utils'

/** 获取小部件列表 */
const getWidgetList = async sendResponse => {
  const { list } = await storeHandles.widget.getAll()
  sendResponse(list)
}

/** 创建添加一个小部件 */
const addWidget = async (widgetData, sendResponse) => {
  const data = await storeHandles.widget.detail(widgetData.id)
  if (!data) {
    await storeHandles.widget.create(widgetData)
  }
  sendResponse(true)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, widgetData } = message

  if (action === 'getWidgetList') {
    getWidgetList(sendResponse)
  } else if (action === 'addWidget') {
    addWidget(widgetData, sendResponse)
  }

  return true
})

const defaultWidgetList = [
  {
    id: 'widget-1',
    name: '必应翻译',
    cover: 'http://124.220.171.110:8000/static/image/widget1.jpg',
    layoutData: { i: 'widget-1', w: 5, h: 3, x: 2, y: 2 },
    sandboxData: {
      editable: true,
      url: 'https://www.bing.com/translator?ref=TThis&text=&from=&to=en&mkt=zh-CN',
    },
    codeData: {
      css: `
        body {
          min-width: 100vw !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow-x: hidden !important;
        }

        .desktop_header_zoom,
        .desktop_header_menu,
        .desktop_header,
        #b_footer,
        #t_lang_attr,
        #tta_phrasebook {
          display: none !important;
        }

        #tt_translatorHome {
          margin: 0 !important;
          width: 100vw !important;
          // height: 100vh !important;
        }
        `,
    },
    wrapData: {},
  },
  {
    id: 'widget-2',
    name: '百度天气',
    cover: 'http://124.220.171.110:8000/static/image/widget3.jpg',
    layoutData: { i: 'widget-2', w: 10, h: 4, x: 8, y: 2 },
    sandboxData: {
      editable: true,
      // extensionMark=vker-desktop-proxy
      url: 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E5%A4%A9%E6%B0%94',
    },
    codeData: {
      css: `
          body {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
          }
          ._content-border_zc167_4.content-border_2OSp3  {
            position: fixed;
            z-index: 999;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            overflow-y: auto;
            overflow-x: hidden;
            background: #fff;
            margin: 0;
          }
          .scroll-scroller_4CQvp.animation_7dmRU,
          .scroll_vtvf1 {
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
          `,
    },
    wrapData: {},
  },
]

defaultWidgetList.forEach(item => addWidget(item, () => {}))
