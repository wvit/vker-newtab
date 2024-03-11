/** 参考： https://github.com/microsoft/monaco-editor/blob/21007360cad28648bdf46282a2592cb47c3a7a6f/samples/browser-esm-vite-react/src/components/Editor.tsx */
import React, { useRef, useState, useEffect, memo } from 'react'
import { message } from 'antd'
import type Monaco from 'monaco-editor'
import './index.less'

export interface EditorProps {
  /** 监听编辑器保存 */
  onSave: (content: string) => void
}

export const Editor = memo((props: EditorProps) => {
  const { onSave } = props
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
      if (state || !monaco) return state
      const monacoEditor = monaco.editor.create(monacoRef.current!, {
        value: `
.desktop_header_zoom {
  display: 'none';
}
`,
        language: 'css',
        theme: 'vs-dark',
        tabSize: 2,
      })

      return monacoEditor
    })
  }

  /** 监听保存编辑器内容 */
  const onEditorSave = e => {
    const { ctrlKey, metaKey, key } = e
    /** 检查是否按下了 Command 键 或 Ctrl 键，并且按下 S 键 */
    if (!((ctrlKey || metaKey) && key === 's')) return

    e.preventDefault()
    messageApi.success('保存成功')
    onSave?.(editor?.getValue() || '')
  }

  useEffect(() => {
    if (monacoRef.current) setTimeout(initEditor, 500)
    return () => editor?.dispose()
  }, [monacoRef.current])

  return (
    <div className="h-[100%]">
      {contextHolder}
      <div ref={monacoRef} className="h-[100%]" onKeyDown={onEditorSave}></div>
    </div>
  )
})
