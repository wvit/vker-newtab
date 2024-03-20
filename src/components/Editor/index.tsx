import React, { useRef, useState, useEffect, memo } from 'react'
import { message, Tree } from '../antd'
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

export const Editor = memo((props: EditorProps) => {
  const { value, fileTree = [], activeFile, onSave, onSelectFile } = props
  const [editor, setEditor] = useState<Monaco.editor.IStandaloneCodeEditor>()
  const [messageApi, contextHolder] = message.useMessage({
    getContainer: () => monacoRef.current,
    prefixCls: 'editor-message',
    duration: 1,
  })
  const monacoRef = useRef<any>()

  /** 初始化编辑器配置 */
  const initEditor = () => {
    setEditor(state => {
      try {
        /** 需要等待 monaco-editor 加载，变量可能未定义 */
        if (state || !monaco || !monacoRef.current) return state
        const monacoEditor = monaco.editor.create(monacoRef.current, {
          language: 'css',
          theme: 'vs-dark',
          tabSize: 2,
        })
        return monacoEditor
      } catch (e) {
        return state
      }
    })
  }

  /** 监听保存编辑器内容 */
  const editorSave = e => {
    const { ctrlKey, metaKey, key } = e
    /** 检查是否按下了 Command 键 或 Ctrl 键，并且按下 S 键 */
    if (!((ctrlKey || metaKey) && key === 's')) return

    e.preventDefault()
    messageApi.success('保存成功')
    onSave?.(editor?.getValue() || '')
  }

  useEffect(() => {
    setTimeout(initEditor, 200)
  }, [monacoRef.current])

  useEffect(() => {
    editor?.setValue(value)
  }, [value])

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
        ref={monacoRef}
        className="h-[100%] w-[100%]"
        onKeyDown={editorSave}
      ></div>
    </div>
  )
})
