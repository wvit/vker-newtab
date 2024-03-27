import { Dom } from './dom'

/** 将文件转为base64 */
export const getBase64 = (file): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = e => reject(e)
  })
}

/** 下载文本内容 */
export const downloadContent = (content: any, fileName: string) => {
  const data = JSON.stringify(content, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  Dom.create('a', { download: fileName, href: url }).click()
  URL.revokeObjectURL(url)
}
