import { memo, useState } from 'react'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 图片地址 */
  src: string
}

export const Image = memo((props: ImageProps) => {
  const { src, className = '', onClick, ...otherProps } = props
  const [visible, setVisible] = useState(false)

  return (
    <>
      {visible && (
        <div
          onClick={() => setVisible(false)}
          className=" fixed w-[100vw] h-[100vh] z-[100] bg-[rgba(0,0,0,0.5)] left-0 top-0 p-16"
        >
          <img src={src} className="max-w-[100%] max-h-[100%]" />
        </div>
      )}
      <img
        className={`w-[100%] h-[100%] object-cover ${className}`}
        src={src}
        onClick={e => {
          setVisible(true)
          onClick?.(e)
        }}
        {...otherProps}
      />
    </>
  )
})
