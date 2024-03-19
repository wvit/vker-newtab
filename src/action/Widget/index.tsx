import React, { memo, useEffect, useState } from 'react'
import { Image, Modal, Form, Input, Collapse } from 'antd'
import { Icon } from '@/components'
import { sendMessage } from '@/utils'
import './index.less'

const { Item, useForm } = Form

/** 小部件管理列表 */
export const Widget = memo(() => {
  const [widgetList, setWidgetList] = useState<WidgetType[]>([])
  const [widgetConfigVisible, setWidgetConfigVisible] = useState(true)
  const [formRef] = useForm()

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
                <Icon name="icon-widget-setting" className="cursor-pointer " />
              </div>
              <Image src={cover} />
            </li>
          )
        })}
      </ul>

      <Modal
        open={widgetConfigVisible}
        width={600}
        title="小部件配置"
        className="widget-modal top-10"
        onCancel={() => setWidgetConfigVisible(false)}
      >
        <Form form={formRef} className=" pt-4">
          <Item name="name" label="小部件名称" rules={[{ required: true }]}>
            <Input />
          </Item>
          <Item name="cover" label="小部件封面" rules={[{ required: true }]}>
            <Input />
          </Item>
          <Item name="type" label="小部件类型" rules={[{ required: true }]}>
            <Input />
          </Item>
          <Item name="url" label="iframe链接" rules={[{ required: true }]}>
            <Input />
          </Item>
          <Collapse
            ghost
            items={[
              {
                key: '1',
                label: '小部件容器样式',
                children: (
                  <>
                    <Item name="resize" label="是否允许调整大小">
                      <Input />
                    </Item>
                    <Item name="width" label="宽度">
                      <Input />
                    </Item>
                    <Item name="height" label="高度">
                      <Input />
                    </Item>
                    <Item name="border-radius" label="圆角">
                      <Input />
                    </Item>
                    <Item name="background-color" label="背景颜色">
                      <Input />
                    </Item>
                    <Item name="opacity" label="整体透明度">
                      <Input />
                    </Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>
    </div>
  )
})
