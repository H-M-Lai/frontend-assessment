'use no memo'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { X } from 'lucide-react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
} from 'lucide-react'

type RichTextEditorProps = {
  content: string
  onChange: (html: string) => void
  disabled?: boolean
  placeholder?: string
}

const btnBase =
  'rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none'

const btnActive =
  'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100'

export function RichTextEditor({ content, onChange, disabled = false, placeholder }: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline dark:text-blue-400',
          },
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Start writing...',
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: true,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-slate dark:prose-invert max-w-none px-3 py-2 min-h-[140px] outline-none focus:outline-none',
      },
    },
  })

  if (!editor) return null

  function openLinkDialog() {
    if (!editor) return
    const existingHref = editor.getAttributes('link').href as string | undefined
    setLinkUrl(existingHref ?? 'https://')
    setLinkDialogOpen(true)
  }

  function confirmLink() {
    if (!editor) return
    const trimmed = linkUrl.trim()

    if (trimmed === '' || trimmed === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run()
    }

    setLinkDialogOpen(false)
    setLinkUrl('')
  }

  function cancelLink() {
    setLinkDialogOpen(false)
    setLinkUrl('')
    editor?.chain().focus().run()
  }

  return (
    <>
      <div
        className={`overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm transition-all dark:border-slate-800 dark:bg-slate-950 ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900/80">
          {/* Text formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${btnBase} ${editor.isActive('bold') ? btnActive : ''}`}
            disabled={disabled}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${btnBase} ${editor.isActive('italic') ? btnActive : ''}`}
            disabled={disabled}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${btnBase} ${editor.isActive('underline') ? btnActive : ''}`}
            disabled={disabled}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${btnBase} ${editor.isActive('strike') ? btnActive : ''}`}
            disabled={disabled}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? btnActive : ''}`}
            disabled={disabled}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? btnActive : ''}`}
            disabled={disabled}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${btnBase} ${editor.isActive('heading', { level: 3 }) ? btnActive : ''}`}
            disabled={disabled}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`}
            disabled={disabled}
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`}
            disabled={disabled}
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Block */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${btnBase} ${editor.isActive('blockquote') ? btnActive : ''}`}
            disabled={disabled}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${btnBase} ${editor.isActive('codeBlock') ? btnActive : ''}`}
            disabled={disabled}
            title="Code block"
          >
            <Code className="h-4 w-4" />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Link */}
          <button
            type="button"
            onClick={openLinkDialog}
            className={`${btnBase} ${editor.isActive('link') ? btnActive : ''}`}
            disabled={disabled}
            title="Add link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={btnBase}
              disabled={disabled}
              title="Remove link"
            >
              <Unlink className="h-4 w-4" />
            </button>
          )}

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className={btnBase}
            disabled={disabled || !editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className={btnBase}
            disabled={disabled || !editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Editor body */}
        <EditorContent editor={editor} />
      </div>

      {/* Link URL Dialog */}
      {linkDialogOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" onClick={cancelLink} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl dark:border dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Insert Link</h2>
              <button onClick={cancelLink} className="rounded-md text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Enter the URL for the selected text. Leave empty to remove the link.
            </p>

            <div className="mt-4">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); confirmLink() }
                  if (e.key === 'Escape') cancelLink()
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
                placeholder="https://example.com"
                autoFocus
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelLink}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLink}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

