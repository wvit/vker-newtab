import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Dom } from '@/utils'
import { Layout } from './Layout'
// import './Editor/userWorker'

Dom.query('head').create('link', { rel: 'stylesheet', href: './index.css' })

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout />
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app') as any).render(<App />)
