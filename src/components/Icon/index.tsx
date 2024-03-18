import React, { memo } from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** 图标名称 */
  name: string
  /** 鼠标移入后的图标颜色 */
  hoverColor?: string
}

/** symbol 图标 */
export const Icon = memo((props: IconProps) => {
  const { name, hoverColor, className = '', ...otherProps } = props

  return (
    <svg
      className={`size-4 hover:fill-[${hoverColor ?? '#1677ff'}] ${className}`}
      {...otherProps}
    >
      <use xlinkHref={`#${name}`}></use>
    </svg>
  )
})
