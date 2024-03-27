import type Monaco from 'monaco-editor'

declare global {
  /** vscode 编辑器 */
  const monaco: typeof Monaco

  /** 小部件参数类型 */
  type WidgetType = {
    /** 小部件id */
    id: string
    /** 小部件名称 */
    name: string
    /** 启用/停用 */
    status: boolean
    /** 简介 */
    intro?: string
    /** 详细描述 */
    desc?: string
    /** 小部件封面图片url */
    cover?: string
    /** 版本号 */
    version?: string
    /** 在 react-grid-layout 中的布局信息 */
    layoutData: { i: string; w: number; h: number; x: number; y: number }
    /** 沙盒配置 */
    sandboxData: { type: 'iframe' | 'custom'; url: string }
    /** 沙盒容器配置 */
    wrapData: {}
    /** 小部件所需的代码 */
    codeData: {
      'index.html'?: string
      'index.css'?: string
      'index.js'?: string
      'content.js'?: string
      'content.css'?: string
    }
  }
}
