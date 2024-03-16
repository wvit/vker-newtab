import React, { useEffect, useState } from 'react'
import GridLayout from 'react-grid-layout'
import qs from 'qs'
import { Dom } from '@/utils'
import { Editor } from '../Editor'

export const Layout = () => {
  const [gridLayout, setGridLayout] = useState<any[]>()

  /** 保存栅格布局数据 */
  const saveGridLayout = layout => {
    setGridLayout(layout)
    localStorage.setItem('gridLayout', JSON.stringify(layout))
  }

  /** 保存编辑器内容 */
  const saveEditor = content => {
    // Dom.query('#sandbox-1').contentWindow.postMessage(
    //   {
    //     action: 'loadSandbox',
    //     codeData: {
    //       css: `
    // body {
    //   min-width: 100vw !important;
    //   width: 100vw !important;
    //   height: 100vh !important;
    //   overflow-x: hidden !important;
    // }

    // .desktop_header_zoom,
    // .desktop_header_menu,
    // .desktop_header,
    // #b_footer,
    // #t_lang_attr,
    // #tta_phrasebook {
    //   display: none !important;
    // }

    // #tt_translatorHome {
    //   margin: 0 !important;
    //   width: 100vw !important;
    //   // height: 100vh !important;
    // }
    // `,
    //     },
    //   },
    //   '*'
    // )

    Dom.query('#sandbox-2').contentWindow.postMessage(
      {
        action: 'loadSandbox',
        codeData: {
          //       css: `
          // body {
          //   width: 100vw;
          //   height: 100vh;
          //   overflow: hidden;
          // }
          // ._content-border_zc167_4.content-border_2OSp3  {
          //   position: fixed;
          //   z-index: 999;
          //   left: 0;
          //   top: 0;
          //   width: 100vw;
          //   height: 100vh;
          //   overflow-y: auto;
          //   overflow-x: hidden;
          //   background: #fff;
          //   margin: 0;
          // }
          // .scroll-scroller_4CQvp.animation_7dmRU,
          // .scroll_vtvf1 {
          //   overflow-x: auto !important;
          //   overflow-y: hidden !important;
          // }
          // `,
        },
      },
      '*'
    )
  }

  useEffect(() => {
    const cacheGridLayout = JSON.parse(
      localStorage.getItem('gridLayout') || 'null'
    )
    if (!cacheGridLayout) return
    setGridLayout(cacheGridLayout)
  }, [])

  gridLayout?.forEach(item => {
    const sandboxMap = {
      'sandbox-1': {
        sandbox: {
          editable: true,
          url: 'https://www.bing.com/translator?ref=TThis&text=&from=&to=en&mkt=zh-CN',
        },
      },
      'sandbox-2': {
        sandbox: {
          editable: false,
          // url: 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E5%A4%A9%E6%B0%94&extensionMark=vker-desktop-proxy',
          url: 'https://baidu.com?extensionMark=vker-desktop-proxy',
        },
      },
    }
    item.sandbox = sandboxMap[item.i].sandbox
  })

  return (
    <div className="h-[100vh] w-[100vw] relative">
      <div
        className="w-[100%] h-[100%] overflow-auto"
        style={{
          background: `url(http://124.220.171.110:8000/static/image/panda1.jpg) center/cover no-repeat`,
        }}
      >
        <div className="h-[100vh] w-[100vw]">
          <GridLayout
            verticalCompact={false}
            cols={24}
            rowHeight={100}
            width={window.innerWidth}
            layout={gridLayout}
            onDragStop={saveGridLayout}
            onResizeStop={saveGridLayout}
          >
            {gridLayout?.map(item => {
              const { sandbox, i } = item
              const domain = sandbox?.url.match(/(https?:\/\/[^\/]+)/)?.[0]
              const protocol = sandbox?.url.match(/^https?:\/\//)?.[0]
              const urlQuery = qs.stringify({
                protocol,
                domain,
                url: sandbox?.url,
                extensionId: `chrome-extension://${chrome.runtime.id}`,
                sandboxId: i,
              })

              return (
                <div
                  key={i}
                  className="flex flex-col rounded overflow-hidden bg-[rgba(255,255,255,0.8)]"
                >
                  <div className="w-[100%] h-[24px] flex justify-end items-center px-2 cursor-pointer box-border">
                    <span className="iconfont icon-code"></span>
                  </div>
                  <iframe
                    id={i}
                    src={
                      sandbox?.editable
                        ? `/sandbox/index.html?${urlQuery}`
                        : sandbox?.url
                    }
                    className="w-[100%] h-0 flex-1 "
                  ></iframe>
                </div>
              )
            })}
          </GridLayout>
        </div>
      </div>

      {/* <div className="w-[50%] h-[100%] bg-[#fff] absolute right-0 top-0">
        <Editor onSave={saveEditor} />
      </div> */}
    </div>
  )
}
