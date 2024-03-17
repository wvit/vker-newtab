import React, { useEffect, useState, useRef } from 'react'
import GridLayout from 'react-grid-layout'
import qs from 'qs'
import { storeHandles } from '@/utils'
import { Editor } from '../Editor'
import './index.less'

export const Layout = () => {
  const [widgetList, setWidgetList] = useState<any[]>([])
  const initSandboxIdsRef = useRef<string[]>([])

  /** 获取小部件列表 */
  const getWidgetList = async () => {
    const { list } = await storeHandles.widget.getAll()
    setWidgetList(list || [])
  }

  /** 保存栅格布局数据 */
  const saveGridLayout = layouts => {
    const newWidgetList = widgetList.map(item => {
      const { id, layoutData } = item
      const findLayout = layouts.find(layoutItem => layoutItem.i === id)
      return { ...item, layoutData: findLayout || layoutData }
    })

    setWidgetList(newWidgetList)
    storeHandles.widget.batchUpdate(newWidgetList)
  }

  /** 初始化沙盒容器 */
  const initSandbox = (ref, widgetData) => {
    const { id, codeData } = widgetData || {}
    /** 已经初始化过，就不再reload */
    if (initSandboxIdsRef.current.includes(id)) return

    initSandboxIdsRef.current.push(id)
    setTimeout(() => {
      ref.contentWindow.postMessage({ action: 'loadSandbox', codeData }, '*')
    }, 100)
  }

  /** 保存编辑器内容 */
  const saveEditor = content => {}

  useEffect(() => {
    getWidgetList()
    storeHandles.widget.onChange(getWidgetList)
  }, [])

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
            margin={[0, 0]}
            layout={widgetList.map(item => item.layoutData)}
            onDragStop={saveGridLayout}
            onResizeStop={saveGridLayout}
          >
            {widgetList?.map(item => {
              const { sandboxData, id } = item
              const domain = sandboxData?.url.match(/(https?:\/\/[^\/]+)/)?.[0]
              const protocol = sandboxData?.url.match(/^https?:\/\//)?.[0]
              const urlQuery = qs.stringify({
                protocol,
                domain,
                url: sandboxData?.url,
                extensionId: `chrome-extension://${chrome.runtime.id}`,
                sandboxId: id,
              })

              return (
                <div
                  key={id}
                  className="flex flex-col rounded overflow-hidden bg-[rgba(255,255,255,0.8)]"
                >
                  <div className="w-[100%] h-[24px] flex justify-end items-center px-2 cursor-pointer box-border">
                    <span className="iconfont icon-code"></span>
                  </div>
                  <iframe
                    ref={ref => initSandbox(ref, item)}
                    id={id}
                    src={
                      sandboxData?.editable
                        ? `/sandbox/index.html?${urlQuery}`
                        : sandboxData?.url
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
