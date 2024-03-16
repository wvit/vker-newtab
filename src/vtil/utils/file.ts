/** 将文件转为base64 */
export const getBase64 = (file): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = e => reject(e)
  })
}
