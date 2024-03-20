import { createRoot } from 'react-dom/client'
import ConfigProvider from 'antd/es/config-provider'
import theme from 'antd/es/theme'
import zhCN from 'antd/locale/zh_CN'
import { Layout } from './Layout'
import './message'
import '@/styles/common.less'

const App = () => {
  const { token } = theme.useToken()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        components: { Tree: { directoryNodeSelectedBg: '#434343' } },
      }}
    >
      <Layout />
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app') as any).render(<App />)
