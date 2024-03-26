import { memo, useEffect, useState } from 'react'
import Switch from 'antd/es/switch'
import Button from 'antd/es/button'
import { Icon } from '@/components/Icon'
import { Action, Message } from '@/utils'
import { Create } from './Create'

/** 小部件管理列表 */
export const Widget = memo(() => {
  const [widgetList, setWidgetList] = useState<WidgetType[]>([])
  const [editWidgetData, setEditWidgetData] = useState<WidgetType | null>(null)
  const [createWidgetVisible, setCreateWidgetVisible] = useState(false)

  /** 获取小部件列表 */
  const getWidgetList = async () => {
    const res = await Message.newtab.activeSend({
      action: Action.Newtab.GetWidgetList,
    })
    setWidgetList(res || [])
  }

  /** 新建或更新小部件 */
  const createWidget = async widgetData => {
    const action = editWidgetData
      ? Action.Newtab.UpdateWidget
      : Action.Newtab.CreateWidget

    await Message.newtab.activeSend({ action, widgetData })

    setEditWidgetData(null)
    setCreateWidgetVisible(false)
    getWidgetList()
  }

  useEffect(() => {
    getWidgetList()
  }, [])

  return (
    <div className="h-[100%] w-[100%] relative">
      <Button
        className="absolute right-0 top-[-48px]"
        onClick={() => setCreateWidgetVisible(true)}
      >
        创建小部件
      </Button>

      <ul className="flex flex-wrap overflow-auto">
        {widgetList?.map(item => {
          const { id, name, version, intro, status } = item

          return (
            <li className="card-item w-[31.2%] h-[150px] m-2 p-2 flex flex-col">
              <h4 className=" text-sm font-medium flex-shrink-0">
                {name}
                {version && (
                  <span className="text-[#999] font-normal">({version})</span>
                )}
              </h4>
              <p className="mt-2 text-xs h-[100%]">{intro}</p>
              <div className="flex-shrink-0 w-[100&] flex items-center">
                <Icon
                  name="icon-widget-setting"
                  className="cursor-pointer "
                  onClick={() => {
                    setEditWidgetData(item)
                    setCreateWidgetVisible(true)
                  }}
                />
                <Switch
                  defaultChecked={status}
                  className="ml-2"
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                  onChange={e => {
                    Message.newtab.activeSend({
                      action: Action.Newtab.UpdateWidget,
                      widgetData: { id, status: e },
                    })
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <Create
        visible={createWidgetVisible}
        editData={editWidgetData!}
        onCancel={() => {
          setEditWidgetData(null)
          setCreateWidgetVisible(false)
        }}
        onSave={createWidget}
      />
    </div>
  )
})
