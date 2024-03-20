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
    /** 小部件封面图片url */
    cover: string
    /** 在 react-grid-layout 中的布局信息 */
    layoutData: { i: string; w: number; h: number; x: number; y: number }
    /** 沙盒配置 */
    sandboxData: { editable: boolean; url: string }
    /** 沙盒容器配置 */
    wrapData: {}
    /** 小部件所需的自定义代码 */
    codeData: {
      'content.css': string
    }
  }
}
