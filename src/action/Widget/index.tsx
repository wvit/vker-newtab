import React, { memo, useEffect, useState } from 'react'
import { Image } from 'antd'
import { sendMessage } from '@/utils'
import './index.less'

/** 小部件管理列表 */
export const Widget = memo(() => {
  const [widgetList, setWidgetList] = useState([])

  /** 获取小部件列表 */
  const getWidgetList = async () => {
    const res = await sendMessage({ action: 'getWidgetList' })
    setWidgetList(res || [])
  }

  /** 新增小部件到桌面 */
  const addWidget = async widgetData => {
    await sendMessage({ action: 'addWidget', widgetData })
    getWidgetList()
  }

  useEffect(() => {
    getWidgetList()
  }, [])

  return (
    <div className="h-[100%] w-[100%] overflow-auto">
      <ul className="flex flex-wrap">
        {widgetList?.map(item => {
          const { name, cover } = item

          return (
            <li className="card-item w-[31.2%] h-[200px] m-2 p-2 flex flex-col">
              <div className="mb-1 flex justify-between items-center">
                {name}
                <span className="iconfont icon-widget-setting cursor-pointer hover:text-[#1677ff]"></span>
              </div>
              <Image src={cover} />
            </li>
          )
        })}
      </ul>
    </div>
  )
})
