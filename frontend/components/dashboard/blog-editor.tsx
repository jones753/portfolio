'use client'

import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { BlogPost } from '@/lib/blog'

type BlogEditorProps = {
  initialPosts: BlogPost[]
}

type EditorState = {
  id?: string
  slug: string
  title: string
  excerpt: string
  content: string
  tagsInput: string
  published: boolean
}

const EMPTY_STATE: EditorState = {
  slug: '',
  title: '',
  excerpt: '',
  content: '# New post\n\nStart writing here...',
  tagsInput: '',
  published: false,
}

function toEditorState(post: BlogPost): EditorState {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    tagsInput: post.tags.join(', '),
    published: post.published,
  }
}

export function BlogEditor({ initialPosts }: BlogEditorProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [selectedPostId, setSelectedPostId] = useState<string | 'new'>(initialPosts[0]?.id ?? 'new')
  const [editor, setEditor] = useState<EditorState>(initialPosts[0] ? toEditorState(initialPosts[0]) : EMPTY_STATE)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const markdownInputRef = useRef<HTMLTextAreaElement | null>(null)

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId),
    [posts, selectedPostId],
  )

  function setField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setEditor((previous) => ({
      ...previous,
      [key]: value,
    }))
  }

  function handleSelectPost(value: string) {
    if (value === 'new') {
      setSelectedPostId('new')
      setEditor(EMPTY_STATE)
      setStatusMessage(null)
      setErrorMessage(null)
      return
    }

    const post = posts.find((item) => item.id === value)
    if (!post) {
      return
    }

    setSelectedPostId(value)
    setEditor(toEditorState(post))
    setStatusMessage(null)
    setErrorMessage(null)
  }

  function insertMarkdown(before: string, after = '', placeholder = '') {
    const input = markdownInputRef.current

    if (!input) {
      setField('content', `${editor.content}${before}${placeholder}${after}`)
      return
    }

    const selectionStart = input.selectionStart
    const selectionEnd = input.selectionEnd
    const selectedText = editor.content.slice(selectionStart, selectionEnd)
    const usedText = selectedText || placeholder
    const insertedText = `${before}${usedText}${after}`
    const nextContent =
      editor.content.slice(0, selectionStart) + insertedText + editor.content.slice(selectionEnd)

    setField('content', nextContent)

    requestAnimationFrame(() => {
      input.focus()

      if (selectedText.length === 0 && placeholder.length > 0) {
        const start = selectionStart + before.length
        input.setSelectionRange(start, start + placeholder.length)
        return
      }

      const cursor = selectionStart + insertedText.length
      input.setSelectionRange(cursor, cursor)
    })
  }

  async function handleSave() {
    setIsSaving(true)
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      const tags = editor.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const payload = {
        slug: editor.slug,
        title: editor.title,
        excerpt: editor.excerpt,
        content: editor.content,
        tags,
        published: editor.published,
      }

      const endpoint = editor.id ? `/api/dashboard/posts/${editor.id}` : '/api/dashboard/posts'
      const method = editor.id ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const rawError = await res.text()
        let serverError = `Save failed (${res.status}).`
        try {
          const parsed = JSON.parse(rawError) as { error?: string }
          if (parsed?.error) {
            serverError = parsed.error
          }
        } catch {
          if (rawError.trim().length > 0) {
            serverError = rawError.trim().slice(0, 200)
          }
        }
        throw new Error(serverError)
      }

      const data = (await res.json()) as { post: BlogPost }
      const savedPost = data.post as BlogPost

      setPosts((previous) => {
        if (editor.id) {
          return previous.map((post) => (post.id === savedPost.id ? savedPost : post))
        }

        return [savedPost, ...previous]
      })

      setSelectedPostId(savedPost.id)
      setEditor(toEditorState(savedPost))
      setStatusMessage('Saved successfully.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save post.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!editor.id) {
      return
    }

    const confirmed = window.confirm('Delete this blog post permanently?')
    if (!confirmed) {
      return
    }

    setStatusMessage(null)
    setErrorMessage(null)
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/dashboard/posts/${editor.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const rawError = await res.text()
        let serverError = `Delete failed (${res.status}).`
        try {
          const parsed = JSON.parse(rawError) as { error?: string }
          if (parsed?.error) {
            serverError = parsed.error
          }
        } catch {
          if (rawError.trim().length > 0) {
            serverError = rawError.trim().slice(0, 200)
          }
        }
        throw new Error(serverError)
      }

      const remaining = posts.filter((post) => post.id !== editor.id)
      setPosts(remaining)

      if (remaining.length > 0) {
        setSelectedPostId(remaining[0].id)
        setEditor(toEditorState(remaining[0]))
      } else {
        setSelectedPostId('new')
        setEditor(EMPTY_STATE)
      }

      setStatusMessage('Post deleted.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete post.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-3 rounded-2xl border border-gray-200 p-4">
        <button
          type="button"
          onClick={() => handleSelectPost('new')}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          + New post
        </button>

        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handleSelectPost(post.id)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  selectedPostId === post.id ? 'border-black bg-gray-100' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-500">{post.published ? 'Published' : 'Draft'}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="space-y-4 rounded-2xl border border-gray-200 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-700" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              value={editor.title}
              onChange={(event) => setField('title', event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-700" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              value={editor.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder="auto-generated for new posts"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              disabled={!editor.id}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-700" htmlFor="excerpt">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={editor.excerpt}
              onChange={(event) => setField('excerpt', event.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-700" htmlFor="tags">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              value={editor.tagsInput}
              onChange={(event) => setField('tagsInput', event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={editor.published}
              onChange={(event) => setField('published', event.target.checked)}
            />
            Published
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm text-gray-700" htmlFor="markdown">
              Markdown
            </label>
            <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 bg-gray-50 p-2">
              <button
                type="button"
                onClick={() => insertMarkdown('# ', '', 'Heading 1')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('## ', '', 'Heading 2')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('**', '**', 'bold text')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('*', '*', 'italic text')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('[', '](https://example.com)', 'link text')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('- ', '', 'list item')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                List
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('`', '`', 'inline code')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => insertMarkdown('```ts\n', '\n```', 'const value = 1')}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold hover:bg-gray-100"
              >
                Code Block
              </button>
            </div>
            <textarea
              id="markdown"
              ref={markdownInputRef}
              value={editor.content}
              onChange={(event) => setField('content', event.target.value)}
              rows={20}
              className="min-h-[460px] w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-700">Preview</p>
            <div className="min-h-[460px] max-w-none rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-900 [&_a]:text-blue-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-gray-100 [&_ul]:list-disc [&_ul]:pl-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{editor.content}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : selectedPost ? 'Update post' : 'Create post'}
          </button>
          {selectedPost ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="rounded-md border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Delete post'}
            </button>
          ) : null}

          {statusMessage ? <p className="text-sm text-green-700">{statusMessage}</p> : null}
          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        </div>
      </section>
    </div>
  )
}
