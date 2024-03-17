import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Widget } from './Widget'
import '@/styles/common.less'

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="w-[800px] h-[600px] p-2 box-border bg-[#f9f9f9]">
        <Widget />
      </div>
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app') as any).render(<App />)
