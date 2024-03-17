import React, { memo } from 'react'
import { Image } from 'antd'
import './index.less'

const defaultWidgetList = [
  {
    name: '必应翻译',
    cover: 'http://124.220.171.110:8000/static/image/widget1.jpg',
    layoutData: {
      i: 'sandbox-1',
      w: 5,
      h: 3,
      x: 2,
      y: 2,
    },
    sandboxData: {
      editable: true,
      url: 'https://www.bing.com/translator?ref=TThis&text=&from=&to=en&mkt=zh-CN',
    },
    codeData: {},
    wrapData: {},
  },
  {
    name: '百度首页',
    cover: 'http://124.220.171.110:8000/static/image/widget2.jpg',
    layoutData: {
      i: 'sandbox-2',
      w: 10,
      h: 4,
      x: 8,
      y: 2,
    },
    sandboxData: {
      editable: false,
      url: 'https://baidu.com?extensionMark=vker-desktop-proxy',
    },
    codeData: {},
    wrapData: {},
  },
  {
    name: '百度天气',
    cover: 'http://124.220.171.110:8000/static/image/widget3.jpg',
    layoutData: {
      i: 'sandbox-2',
      w: 10,
      h: 4,
      x: 8,
      y: 2,
    },
    sandboxData: {
      editable: true,
      url: 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E5%A4%A9%E6%B0%94&extensionMark=vker-desktop-proxy',
    },
    codeData: {},
    wrapData: {},
  },
]

/** 小部件管理列表 */
export const Widget = memo(() => {
  return (
    <div className="h-[100%] w-[100%] overflow-auto">
      <ul className="flex flex-wrap">
        {defaultWidgetList.map(item => {
          const { name, cover } = item

          return (
            <li className="card-item w-[31.2%] h-[200px] m-2 p-2 flex flex-col">
              <div className="mb-1 flex justify-between items-center">
                {name}
                <span className="iconfont icon-widget-setting cursor-pointer hover:text-[#1677ff]"></span>
              </div>
              <Image src={cover} />
            </li>
          )
        })}
      </ul>
    </div>
  )
})
