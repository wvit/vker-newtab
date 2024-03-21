import { memo, useEffect, useState } from 'react'
import Modal from 'antd/es/modal'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Collapse from 'antd/es/collapse'
import Popover from 'antd/es/popover'
import Radio from 'antd/es/radio'
import { Icon } from '@/components/Icon'
import { Image } from '@/components/Image'
import { Upload } from '@/components/Upload'
import { sendMessage, getBase64 } from '@/utils'
import './index.less'

const { Item, useForm } = Form

/** 小部件管理列表 */
export const Widget = memo(() => {
  const [widgetList, setWidgetList] = useState<WidgetType[]>([])
  const [editWidgetData, setEditWidgetData] = useState<WidgetType | null>(null)
  const [formRef] = useForm()

  /** 获取小部件列表 */
  const getWidgetList = async () => {
    const res = await sendMessage({ action: 'getWidgetList' })
    setWidgetList(res || [])
  }

  /** 新增小部件到桌面 */
  const addWidget = async () => {
    if (!editWidgetData) return
    const values = await formRef.validateFields()
    const newData = Object.keys(values!).reduce((prev, key) => {
      const value = values[key]

      if (Object.prototype.toString.call(value) === '[object Object]') {
        prev[key] = { ...prev[key], ...value }
      } else {
        prev[key] = value
      }

      return prev
    }, editWidgetData)

    await sendMessage({ action: 'updateWidget', widgetData: newData })

    setEditWidgetData(null)
    getWidgetList()
  }

  useEffect(() => {
    getWidgetList()
  }, [])

  useEffect(() => {
    if (editWidgetData) {
      formRef.resetFields()
      formRef.setFieldsValue(editWidgetData)
    }
  }, [editWidgetData])

  return (
    <div className="h-[100%] w-[100%] overflow-auto">
      <ul className="flex flex-wrap">
        {widgetList?.map(item => {
          const { name, cover } = item

          return (
            <li className="card-item w-[31.2%] h-[200px] m-2 p-2 flex flex-col">
              <div className="mb-1 flex justify-between items-center">
                {name}
                <Icon
                  name="icon-widget-setting"
                  className="cursor-pointer "
                  onClick={() => setEditWidgetData(item)}
                />
              </div>
              <Image src={cover} />
            </li>
          )
        })}
      </ul>

      <Modal
        open={!!editWidgetData}
        width={600}
        title="小部件配置"
        className="widget-modal top-10"
        onCancel={() => setEditWidgetData(null)}
        onOk={addWidget}
      >
        <Form
          form={formRef}
          className=" pt-4"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          <Item name="name" label="小部件名称" rules={[{ required: true }]}>
            <Input placeholder="请输入小部件名称" />
          </Item>
          <Item name="cover" label="小部件封面" rules={[{ required: true }]}>
            <Upload
              onTransformFile={async e => {
                return await getBase64(e.target.files?.[0])
              }}
            />
          </Item>
          <Item
            name={['sandboxData', 'type']}
            label="小部件类型"
            rules={[{ required: true }]}
          >
            <Radio.Group
              options={[
                {
                  label: (
                    <span className="flex items-center">
                      iframe
                      <Popover content="添加一个iframe地址，可向iframe内插入 css、js 来修改内容">
                        <Icon name="icon-help" className=" ml-1 !size-3" />
                      </Popover>
                    </span>
                  ),
                  value: 'iframe',
                },
                {
                  label: (
                    <span className="flex items-center">
                      自定义页面
                      <Popover content="可在代码编辑器中直接添加 html、css、js">
                        <Icon name="icon-help" className=" ml-1 !size-3" />
                      </Popover>
                    </span>
                  ),
                  value: 'html',
                },
              ]}
            />
          </Item>

          <Item noStyle dependencies={[['sandboxData', 'type']]}>
            {() => {
              return (
                formRef.getFieldValue(['sandboxData', 'type']) === 'iframe' && (
                  <Item
                    name={['sandboxData', 'url']}
                    label="iframe链接"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="请填写iframe链接地址" />
                  </Item>
                )
              )
            }}
          </Item>

          <Collapse
            ghost
            items={[
              {
                key: '1',
                label: '小部件容器样式',
                children: (
                  <>
                    <Item
                      name={['wrapData', 'resize']}
                      label="是否允许调整大小"
                    >
                      <Switch />
                    </Item>
                    <Item
                      name={['wrapData', 'border-radius']}
                      label="圆角"
                      wrapperCol={{ span: 8 }}
                    >
                      <Input placeholder="例如 50px 或 50%" />
                    </Item>
                    <Item
                      name={['wrapData', 'opacity']}
                      label="整体透明度"
                      wrapperCol={{ span: 8 }}
                    >
                      <Input placeholder="0 - 1 之间的不透明度" />
                    </Item>
                    <Item
                      name={['wrapData', 'background-color']}
                      label="背景颜色"
                    >
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
