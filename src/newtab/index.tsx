import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import axios from 'axios'
import { Layout } from './Layout'
import './index.less'

window.addEventListener('message', e => {
  const { action, method, url, headers, body, xhrSendKey } = e.data

  if (action === 'xhrSend') {
    axios({
      method,
      url,
      headers,
      data: body,
    }).then(res => {
      const { data, status, statusText, headers } = res
      const iframe: any = document.querySelector('.iframe')
      const jsonType = headers['content-type']?.includes('application/json;')

      iframe.contentWindow.postMessage(
        {
          action: 'forward',
          forwardData: {
            action: 'xhrResponse',
            xhrSendKey,
            status,
            statusText,
            headers,
            responseText: jsonType ? JSON.stringify(data) : data,
          },
        },
        '*'
      )
    })
  }
})

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout />
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app') as any).render(<App />)
