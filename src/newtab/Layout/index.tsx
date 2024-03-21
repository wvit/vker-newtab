import { useEffect, useState, useRef } from 'react'
import GridLayout from 'react-grid-layout'
import { Icon } from '@/components/Icon'
import { Editor } from '@/components/Editor'
import { Dom, urlQuery } from '@/utils'
import { storeHandles } from '@/utils/store'
import './index.less'

export const Layout = () => {
  const [widgetList, setWidgetList] = useState<any[]>([])
  const [fileTree, setFileTree] = useState<any[]>([])
  const [activeFile, setActiveFile] = useState('')
  const [currentCodeValue, setCurrentCodeValue] = useState('')
  const initSandboxIdsRef = useRef<string[]>([])

  /** 获取小部件列表 */
  const getWidgetList = async () => {
    const { list } = await storeHandles.widget.getAll()
    const treeData = list.map(item => {
      const { name, id, codeData } = item
      const fileList = Object.keys(codeData).map(key => {
        return {
          key: `${id}:${key}`,
          title: key,
          codeValue: codeData[key],
          icon: () => {
            const iconProps = {
              css: { name: 'icon-css', className: 'size-5' },
              js: { name: 'icon-js', className: 'size-3' },
              ts: { name: 'icon-ts' },
            }[key.split('.')[1]]

            return iconProps && <Icon {...iconProps} />
          },
        }
      })

      return { title: name, key: id, children: fileList }
    })

    setFileTree(treeData)
    setWidgetList(list || [])
  }

  /** 初始化沙盒容器 */
  const initSandbox = (ref, widgetData) => {
    const { id, codeData } = widgetData || {}
    /** 已经初始化过，就不再reload */
    if (initSandboxIdsRef.current.includes(id)) return

    initSandboxIdsRef.current.push(id)
    setTimeout(() => {
      ref.contentWindow.postMessage({ action: 'loadSandbox', codeData }, '*')
    }, 200)
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

  /** 选中文件项 */
  const selectFile = selectNode => {
    const { codeValue, key } = selectNode
    if (!codeValue) return

    setCurrentCodeValue(codeValue)
    setActiveFile(key)
  }

  /** 保存编辑器内容 */
  const saveEditor = async content => {
    if (!activeFile) return
    const [id, key] = activeFile.split(':')
    const findWidget = widgetList.find(item => item.id === id)
    const sandbox = Dom.query(`#${id}`)
    if (!findWidget || !sandbox) return
    const { codeData } = findWidget

    codeData[key] = content
    await storeHandles.widget.update({ id, codeData })
    sandbox.contentWindow.postMessage({ action: 'loadSandbox', codeData }, '*')
  }

  useEffect(() => {
    getWidgetList()
    storeHandles.widget.onChange(getWidgetList)
  }, [])

  return (
    <div className="h-[100vh] w-[100vw] flex overflow-hidden">
      <div
        className="h-[100%] w-[100%] overflow-x-auto"
        onClickCapture={() => setActiveFile('')}
      >
        <div
          className="h-[100vh] w-[100vw] overflow-y-auto"
          style={{
            background: `url(http://124.220.171.110:8000/static/image/panda1.jpg) center/cover no-repeat`,
          }}
        >
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
              const { sandboxData, codeData, id } = item
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

              return (
                <div
                  key={id}
                  className="sandbox-item flex flex-col rounded overflow-hidden "
                >
                  <div className="sandbox-header overflow-hidden bg-[rgba(255,255,255,0.6)] w-[100%] h-0 flex justify-end items-center px-2 cursor-pointer transition-[200ms] absolute top-0 left-0">
                    <Icon
                      name="icon-code"
                      onClick={() => {
                        selectFile({
                          key: `${id}:css`,
                          codeValue: codeData?.['content.css'],
                        })
                      }}
                    />
                  </div>
                  <iframe
                    ref={ref => initSandbox(ref, item)}
                    id={id}
                    src={editable ? `/sandbox/index.html?${queryString}` : url}
                    className="w-[100%] h-0 flex-1 "
                  ></iframe>
                </div>
              )
            })}
          </GridLayout>
        </div>
      </div>
      <div
        className="w-[50%] h-[100%] flex-shrink-0 bg-[#fff] duration-200"
        style={{
          marginRight: activeFile ? 0 : '-100%',
        }}
      >
        <Editor
          value={currentCodeValue}
          activeFile={activeFile}
          fileTree={fileTree}
          onSave={saveEditor}
          onSelectFile={selectFile}
        />
      </div>
    </div>
  )
}
