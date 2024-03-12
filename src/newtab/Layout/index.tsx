import React, { useEffect, useState } from 'react'
import GridLayout from 'react-grid-layout'
import { Row, Col } from 'antd'
import { Dom } from '@/utils'
import pandaImg from '@/assets/imgs/panda.jpeg'
import { Editor } from '../Editor'

export const Layout = () => {
  const [gridLayout, setGridLayout] = useState()

  /** 保存栅格布局数据 */
  const saveGridLayout = layout => {
    setGridLayout(layout)
    localStorage.setItem('gridLayout', JSON.stringify(layout))
  }

  /** 保存编辑器内容 */
  const saveEditor = content => {
    fetch(
      'https://www.bing.com/translator?ref=TThis&text=&from=&to=en&mkt=zh-CN',
      {
        headers: {
          'sec-ch-ua':
            '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'upgrade-insecure-requests': '1',
        },
        referrer: 'http://localhost:8000/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      }
    )
      .then(res => res.text())
      .then(async res => {
        Dom.query('.iframe').contentWindow.postMessage(
          {
            action: 'iframeLoad',
            iframeContent: res,
            cssContent: content,
          },
          '*'
        )
      })
  }

  useEffect(() => {
    const cacheGridLayout = JSON.parse(
      localStorage.getItem('gridLayout') || 'null'
    )
    if (!cacheGridLayout) return
    setGridLayout(cacheGridLayout)
  }, [])

  return (
    <Row className="h-[100vh] w-[100vw]">
      <Col span={12}>
        <div
          className="h-[100%] w-[100%] overflow-auto"
          style={{
            background: `url(${pandaImg}) center/cover no-repeat`,
          }}
        >
          <GridLayout
            verticalCompact={false}
            cols={24}
            rowHeight={100}
            width={window.innerWidth}
            layout={gridLayout}
            onDragStop={saveGridLayout}
            onResizeStop={saveGridLayout}
          >
            <div
              key="a"
              className="flex flex-col rounded overflow-hidden bg-[rgba(255,255,255,0.8)]"
            >
              <div className="w-[100%] h-[24px] flex justify-end items-center px-2 cursor-pointer box-border">
                <span className="iconfont icon-code"></span>
              </div>
              <iframe
                // src="https://cn.bing.com/translator?ref=TThis&text=&from=&to=en"
                // src={`http://127.0.0.1:8080/iframe.html?t=${Date.now()}`}
                src={`chrome-extension://kpgohkejeinlkekmbdmgeplmbjfmmgmp/iframe/index.html`}
                className="iframe w-[100%] h-0 flex-1 "
              ></iframe>
              {/* <div className="sandbox w-[100%] h-0 flex-1 "></div> */}
            </div>
          </GridLayout>
        </div>
      </Col>
      <Col span={12}>
        <div className="w-[100%] h-[100%] bg-[#fff]">
          <div className="h-[100%]">
            <Editor onSave={saveEditor} />
          </div>
        </div>
      </Col>
    </Row>
  )
}
