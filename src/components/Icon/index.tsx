import { memo } from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** 图标名称 */
  name: string
}

/** symbol 图标 */
export default memo((props: IconProps) => {
  const { name, className = '', ...otherProps } = props

  return (
    <svg className={`size-4 hover:fill-[#1677ff] ${className}`} {...otherProps}>
      <use xlinkHref={`#${name}`}></use>
    </svg>
  )
})
