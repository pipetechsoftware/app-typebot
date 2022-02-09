import { Box, BoxProps } from '@chakra-ui/react'
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  lang?: 'css' | 'json'
  onChange?: (value: string) => void
  isReadOnly?: boolean
}
export const CodeEditor = ({
  value,
  lang,
  onChange,
  isReadOnly = false,
  ...props
}: Props & Omit<BoxProps, 'onChange'>) => {
  const editorContainer = useRef<HTMLDivElement | null>(null)
  const editorView = useRef<EditorView | null>(null)
  const [plainTextValue, setPlainTextValue] = useState(value)

  useEffect(() => {
    if (!editorView.current || !isReadOnly) return
    editorView.current.dispatch({
      changes: { from: 0, insert: value },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    if (!onChange || plainTextValue === value) return
    onChange(plainTextValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainTextValue])

  useEffect(() => {
    if (!editorContainer.current) return
    const updateListenerExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange)
        setPlainTextValue(update.state.doc.toJSON().join(' '))
    })
    const extensions = [
      updateListenerExtension,
      basicSetup,
      EditorState.readOnly.of(isReadOnly),
    ]
    if (lang === 'json') extensions.push(json())
    if (lang === 'css') extensions.push(css())
    const editor = new EditorView({
      state: EditorState.create({
        extensions,
      }),
      parent: editorContainer.current,
    })
    editor.dispatch({
      changes: { from: 0, insert: value },
    })
    editorView.current = editor
    return () => {
      editor.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box ref={editorContainer} h="200px" data-testid="code-editor" {...props} />
  )
}