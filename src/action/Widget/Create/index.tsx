import { memo, useEffect } from 'react'
import Modal from 'antd/es/modal'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Switch from 'antd/es/switch'
import Collapse from 'antd/es/collapse'
import Popover from 'antd/es/popover'
import Radio from 'antd/es/radio'
import ColorPicker from 'antd/es/color-picker'
import { Icon } from '@/components/Icon'
import { getId } from '@/utils'
import './index.less'

const { Item, useForm } = Form

export interface CreateProps {
  /** 弹窗显隐 */
  visible: boolean
  /** 编辑数据 */
  editData?: WidgetType
  /** 保存小部件数据 */
  onSave: (widgetData: WidgetType) => void
  /** 取消操作弹窗 */
  onCancel: () => void
}

/** 创建/编辑小部件 */
export const Create = memo((props: CreateProps) => {
  const { visible, editData, onSave, onCancel } = props
  const [formRef] = useForm()

  /** 获取默认小部件数据 */
  const getDefaultData = (sandboxType: WidgetType['sandboxData']['type']) => {
    const id = getId()
    const codeData = {
      iframe: { 'content.css': '', 'content.js': '' },
      custom: { 'index.html': '', 'index.css': '', 'index.js': '' },
    }[sandboxType]

    return {
      id,
      codeData,
      layoutData: { i: id, w: 5, h: 5, x: 1, y: 1 },
    }
  }

  /** 保存小部件数据 */
  const saveWidgetData = async () => {
    const values = await formRef.validateFields()
    const currentData = editData || getDefaultData(values.sandboxData.type)
    const widgetData = Object.keys(values).reduce((prev, key) => {
      const value = values[key]

      if (Object.prototype.toString.call(value) === '[object Object]') {
        prev[key] = { ...prev[key], ...value }
      } else {
        prev[key] = value
      }

      return prev
    }, currentData) as WidgetType

    onSave?.(widgetData)
  }

  useEffect(() => {
    if (!visible) return
    formRef.resetFields()
    formRef.setFieldsValue(editData)
  }, [visible])

  return (
    <Modal
      open={visible}
      width={600}
      title="小部件配置"
      className="widget-modal top-10"
      onCancel={onCancel}
      onOk={saveWidgetData}
    >
      <Form
        form={formRef}
        initialValues={{
          sandboxData: { type: 'iframe' },
          wrapData: {
            resize: true,
            opacity: 1,
            'background-color': 'rgba(0,0,0,0.5)',
          },
        }}
        className=" pt-4"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
      >
        <Item name="name" label="小部件名称" rules={[{ required: true }]}>
          <Input placeholder="请输入小部件名称" />
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
                    自定义小部件
                    <Popover content="可在代码编辑器中直接添加 html、css、js">
                      <Icon name="icon-help" className=" ml-1 !size-3" />
                    </Popover>
                  </span>
                ),
                value: 'custom',
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

        <Item name="intro" label="小部件描述">
          <Input placeholder="请输入小部件描述" />
        </Item>

        <Collapse
          ghost
          activeKey={['1']}
          items={[
            {
              key: '1',
              label: '小部件容器样式',
              children: (
                <>
                  <Item name={['wrapData', 'resize']} label="是否允许调整大小">
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
                    getValueFromEvent={e => e.toRgbString()}
                  >
                    <ColorPicker showText format="rgb" />
                  </Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  )
})
