import { useEffect, useState } from 'react'
import GridLayout from 'react-grid-layout'
import { Icon } from '@/components/Icon'
import { Editor } from '@/components/Editor'
import { storeHandles } from '@/utils/store'
import { Dom, Message, Action } from '@/utils'
import { Widget } from '../Widget'
import './index.less'

export const Layout = () => {
  const [widgetList, setWidgetList] = useState<WidgetType[]>([])
  const [fileTree, setFileTree] = useState<any[]>([])
  const [activeFile, setActiveFile] = useState('')
  const [currentCodeValue, setCurrentCodeValue] = useState('')

  /** 获取小部件列表 */
  const getWidgetList = async () => {
    const { list } = await storeHandles.widget.getAll()
    const filterList = list.filter(item => item.status)
    const treeData = filterList.map(item => {
      const { name, id, codeData } = item
      const fileList = Object.keys(codeData).map(key => {
        return {
          key: `${id}:${key}`,
          title: key,
          codeValue: codeData[key],
          icon: () => {
            const iconProps = {
              html: { name: 'icon-html' },
              css: { name: 'icon-css', className: 'size-5' },
              js: { name: 'icon-js', className: '!size-3' },
            }[key.split('.')[1]]

            return iconProps && <Icon {...iconProps} />
          },
        }
      })

      return { title: name, key: id, children: fileList }
    })

    setFileTree(treeData)
    setWidgetList(filterList || [])
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
    if (codeValue === undefined) return

    setCurrentCodeValue(codeValue)
    setActiveFile(key)
  }

  /** 保存编辑器内容 */
  const saveEditor = async content => {
    if (!activeFile) return
    const [id, key] = activeFile.split(':')
    const findWidget = widgetList.find(item => item.id === id)
    const sandbox = Dom.queryId(id)
    if (!findWidget || !sandbox) return
    const { codeData, sandboxData } = findWidget

    codeData[key] = content
    await storeHandles.widget.update({ id, codeData })
    Message.window.send(sandbox.contentWindow, {
      action: Action.Window.LoadSandbox,
      sandboxData,
      codeData,
    })
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
            {widgetList.map(item => (
              <div key={item.id}>
                <Widget widgetData={item} onSelectFile={selectFile} />
              </div>
            ))}
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
