import { Image } from '../Image'
import message from 'antd/es/message'

export interface UploadProps {
  /** 文件资源地址 */
  value?: string
  /** 最大文件大小限制，单位 KB */
  maxSize?: number
  /** 在触发 onChange 之前转换文件内容 */
  onTransformFile?: (e: React.ChangeEvent<HTMLInputElement>) => any
  /** 文件上传结束事件 */
  onChange?: (value: any) => void
}

export const Upload = (props: UploadProps) => {
  const { value, maxSize = 5 * 1024 * 1024, onTransformFile, onChange } = props

  /** 文件值改变 */
  const fileChange = async e => {
    const file = e.target.files[0]
    if (file.size > maxSize) return message.error(`文件最大为 ${maxSize}KB`)
    const newValue = onTransformFile ? await onTransformFile(e) : e

    onChange?.(newValue)
  }

  return (
    <div className=" relative flex justify-center items-center flex-col w-[100px] h-[100px] border border-dashed border-[#999] rounded-md overflow-hidden">
      {value ? (
        <Image src={value} />
      ) : (
        <>
          <span className="text-[32px] font-thin">+</span>
          <p className=" text-xs">点击上传图片</p>
        </>
      )}
      <input
        className=" absolute w-[100%] h-[100%] z-10 opacity-0"
        type="file"
        accept="image/*"
        onChange={fileChange}
      />
    </div>
  )
}
