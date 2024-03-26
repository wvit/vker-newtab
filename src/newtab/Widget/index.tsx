import { memo, useRef } from 'react'
import { Icon } from '@/components/Icon'
import { Message, Action, urlQuery } from '@/utils'
import './index.less'

export interface WidgetProps {
  /** 小部件数据 */
  widgetData: WidgetType
  /** 选中打开文件 */
  onSelectFile: (fileData: { key?: string; codeValue?: string }) => void
}

/** newtab 页面中展示的小部件 */
export const Widget = memo((props: WidgetProps) => {
  const { widgetData, onSelectFile } = props
  const initSandboxIdsRef = useRef<string[]>([])

  const { sandboxData, wrapData, codeData, id } = widgetData
  const { url, editable } = sandboxData || {}
  const domain = url?.match(/(https?:\/\/[^\/]+)/)?.[0]
  const protocol = url?.match(/^https?:\/\//)?.[0]
  const queryString = urlQuery.stringify({
    protocol,
    domain,
    url,
    extensionId: `chrome-extension://${chrome.runtime.id}`,
    sandboxId: id,
  })

  /** 初始化沙盒容器 */
  const initSandbox = ref => {
    /** 已经初始化过，就不再reload */
    if (initSandboxIdsRef.current.includes(id)) return

    initSandboxIdsRef.current.push(id)
    ref.onload = () => {
      Message.window.send(ref.contentWindow, {
        action: Action.Window.LoadSandbox,
        codeData,
      })
    }
  }

  return (
    <div
      className="widget-item h-[100%] flex flex-col rounded overflow-hidden "
      style={wrapData}
    >
      <div className="widget-header overflow-hidden bg-[rgba(255,255,255,0.5)] w-[100%] h-0 flex justify-end items-center px-2 cursor-pointer transition-[200ms] absolute top-0 left-0">
        <Icon
          name="icon-code"
          onClick={() => {
            const fileName = Object.keys(codeData)[0]
            onSelectFile?.({
              key: `${id}:${fileName}`,
              codeValue: codeData?.[fileName],
            })
          }}
        />
      </div>
      <iframe
        ref={ref => initSandbox(ref)}
        id={id}
        src={editable ? `/sandbox/index.html?${queryString}` : url}
        className="w-[100%] h-0 flex-1 "
      ></iframe>
    </div>
  )
})
