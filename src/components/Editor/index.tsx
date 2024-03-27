import { useRef, useEffect, memo } from 'react'
import Tree from 'antd/es/tree'
import message from 'antd/es/message'
import type Monaco from 'monaco-editor'
import type { TreeProps } from 'antd/es/tree'
import './index.less'

export interface EditorProps {
  /** 编辑器内容 */
  value: string
  /** 文件树数据 */
  fileTree: TreeProps['treeData']
  /** 当前选中的文件key */
  activeFile: string
  /** 监听编辑器保存 */
  onSave: (content: string) => void
  /** 当前选中的文件改变 */
  onSelectFile: (selectNode: any) => void
}

/** vscode 风格编辑器 */
export const Editor = memo((props: EditorProps) => {
  const { value, fileTree = [], activeFile, onSave, onSelectFile } = props
  const [messageApi, contextHolder] = message.useMessage({
    getContainer: () => monacoWrapRef.current,
    prefixCls: 'editor-message',
    duration: 1,
  })
  const monacoWrapRef = useRef<any>()
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>()

  /** 初始化编辑器配置 */
  const initEditor = () => {
    try {
      /** 需要等待 monaco-editor 加载，变量可能未定义 */
      if (editorRef.current || !monacoWrapRef.current || !monaco) return

      editorRef.current = monaco.editor.create(monacoWrapRef.current, {
        theme: 'vs-dark',
        tabSize: 2,
      })
    } catch (e) {}
  }

  /** 改变编辑器当前的编程语言 */
  const changeLanguage = () => {
    if (!activeFile) return
    const fileExt = activeFile.split(':')[1]?.split('.')[1]
    const language = {
      js: 'javascript',
      css: 'css',
      html: 'html',
    }[fileExt]
    const model = editorRef.current?.getModel()

    monaco?.editor.setModelLanguage(model!, language!)
  }

  /** 监听保存编辑器内容 */
  const editorSave = e => {
    const { ctrlKey, metaKey, key } = e
    /** 检查是否按下了 Command 键 或 Ctrl 键，并且按下 S 键 */
    if (!((ctrlKey || metaKey) && key === 's')) return
    const content = editorRef.current?.getValue() || ''

    e.preventDefault()
    messageApi.success('保存成功')
    onSave?.(content)
  }

  useEffect(() => {
    initEditor()
  }, [monacoWrapRef.current])

  useEffect(() => {
    editorRef.current?.setValue(value)
  }, [value])

  useEffect(() => {
    changeLanguage()
  }, [activeFile])

  return (
    <div className="h-[100%] flex relative editor-wrap">
      {contextHolder}
      <div className="w-[200px] flex-shrink-0">
        {!!fileTree.length && (
          <Tree.DirectoryTree
            defaultExpandAll
            selectedKeys={[activeFile]}
            treeData={fileTree}
            onSelect={(_, e) => onSelectFile?.(e.node)}
          />
        )}
      </div>
      <div
        ref={monacoWrapRef}
        className="h-[100%] w-[100%]"
        onKeyDown={editorSave}
      ></div>
    </div>
  )
})
