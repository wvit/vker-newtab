import React, { memo } from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** 图标名称 */
  name: string
  /** 图标组件类名 */
  className?: string
}

/** symbol 图标 */
export const Icon = memo((props: IconProps) => {
  const { name, className = '', ...otherProps } = props

  return (
    <svg className={`size-4 ${className}`} {...otherProps}>
      <use xlinkHref={`#${name}`}></use>
    </svg>
  )
})
