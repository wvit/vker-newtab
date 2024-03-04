import React, { useEffect } from 'react'
import GridLayout from 'react-grid-layout'
import { Dom } from '@/utils'
import pandaImg from '@/assets/imgs/panda.jpeg'

export const Layout = () => {
  useEffect(() => {
    const baidu = Dom.query('#baidu')

    var newCSP = "frame-ancestors 'self' example.com *.example.com"
    var meta = baidu.contentWindow.document.createElement('meta')
    meta.httpEquv = 'Content-Security-Policy'
    meta.content = newCSP
    baidu.contentWindow.document.head.appendChild(meta)
  }, [])

  return (
    <div
      className="h-[100vh] w-[100vw] overflow-auto"
      style={{
        background: `url(${pandaImg}) center/100% no-repeat`,
      }}
    >
      <GridLayout cols={24} rowHeight={100} width={window.innerWidth}>
        <div
          key="a"
          className="bg-[#fff] flex flex-col rounded overflow-hidden"
          data-grid={{ x: 0, y: 0, w: 10, h: 3 }}
        >
          <div className="w-[100%] h-[20px] bg-[#fff]"></div>
          <iframe
            src="https://cn.bing.com/translator?ref=TThis&text=&from=&to=en"
            className="w-[100%] h-0 flex-1 "
          ></iframe>
        </div>
        <div
          key="b"
          className="bg-[#fff] flex flex-col rounded overflow-hidden"
          data-grid={{ x: 10, y: 0, w: 10, h: 3 }}
        >
          <div className="w-[100%] h-[20px] bg-[#fff]"></div>
          <iframe
            id="baidu"
            src="http://www.baidu.com/s?wd=%E7%99%BE%E5%BA%A6%E5%A4%A9%E6%B0%94"
            // src="https://weathernew.pae.baidu.com/weathernew/pc?query=%E5%9B%9B%E5%B7%9D%E6%88%90%E9%83%BD%E5%A4%A9%E6%B0%94&srcid=4982&forecast=long_day_forecast"
            className="w-[100%] h-0 flex-1 "
          ></iframe>
        </div>
      </GridLayout>
    </div>
  )
}
