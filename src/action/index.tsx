import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import ConfigProvider from 'antd/es/config-provider'
import Radio from 'antd/es/radio'
import zhCN from 'antd/es/locale/zh_CN'
import { Widget } from './Widget'
import '@/styles/common.less'

const pageBtns = [
  { label: '小部件配置', value: 'widget' },
  { label: '布局配置', value: 'layout' },
] as const

const App = () => {
  const [activePage, setActivePage] =
    useState<(typeof pageBtns)[number]['value']>('widget')

  return (
    <ConfigProvider locale={zhCN}>
      <div className="w-[800px] h-[600px] p-2 bg-[#f9f9f9] flex flex-col">
        <Radio.Group
          defaultValue="widget"
          buttonStyle="solid"
          className=" mb-4"
          optionType="button"
          onChange={e => setActivePage(e.target.value)}
          options={pageBtns as any}
        />

        <div className="h-0 flex-1">
          {activePage === 'widget' && <Widget />}
        </div>
      </div>
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app') as any).render(<App />)
