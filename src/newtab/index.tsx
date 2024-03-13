import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import axios from 'axios'
import { Layout } from './Layout'
import './index.less'

window.addEventListener('message', e => {
  const { action, forward, requestData, callbackData } = e.data

  if (action === 'request') {
    const { method, url, headers, body } = requestData || {}
    axios({
      method,
      url,
      headers,
      data: body,
      withCredentials: true,
    }).then(res => {
      const { data, status, statusText, headers } = res
      const iframe: any = document.querySelector('.iframe')
      const jsonType = headers['content-type']?.includes('application/json;')
      const resultData = {
        ...callbackData,
        responseData: {
          status,
          statusText,
          headers,
          responseText: jsonType ? JSON.stringify(data) : data,
        },
      }

      iframe.contentWindow.postMessage(
        forward
          ? {
              action: 'forward',
              forwardData: resultData,
            }
          : { ...resultData },
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
