import React, { useEffect, useState } from 'react'
import GridLayout from 'react-grid-layout'
// import Editor from '@monaco-editor/react'
import { Row, Col } from 'antd'
import { Editor } from '../Editor'
import pandaImg from '@/assets/imgs/panda.jpeg'
// import '../Editor/userWorker'

export const Layout = () => {
  const [gridLayout, setGridLayout] = useState()

  /** 保存栅格布局数据 */
  const saveGridLayout = layout => {
    setGridLayout(layout)
    localStorage.setItem('gridLayout', JSON.stringify(layout))
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
              {/* <iframe
                src="https://cn.bing.com/translator?ref=TThis&text=&from=&to=en"
                className="w-[100%] h-0 flex-1 "
              ></iframe> */}
            </div>
          </GridLayout>
        </div>
      </Col>
      <Col span={12}>
        <div className="w-[100%] h-[100%] bg-[#fff]">
          <div className="h-[100%]">
            <Editor />
          </div>
        </div>
      </Col>
    </Row>
  )
}
