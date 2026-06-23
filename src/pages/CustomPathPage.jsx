import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { SIDEBAR_WIDTH } from '../lib/constants'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'

const DEFAULT_TOPIC_FORM = {
  title: '',
  keyTerms: '',
  learningOutcomes: '',
  resourceUrl: '',
}

function normalizeResourceUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function TopicFormFields({ form, setForm }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Key Terms
        </label>
        <input
          type="text"
          placeholder="comma, separated, terms"
          value={form.keyTerms}
          onChange={(e) => setForm((prev) => ({ ...prev, keyTerms: e.target.value }))}
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Learning Outcomes
        </label>
        <textarea
          rows={2}
          value={form.learningOutcomes}
          onChange={(e) => setForm((prev) => ({ ...prev, learningOutcomes: e.target.value }))}
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Resource URL
        </label>
        <input
          type="text"
          placeholder="https://..."
          value={form.resourceUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, resourceUrl: e.target.value }))}
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
    </>
  )
}

function TopicForm({ form, setForm, onSubmit, onCancel, isEditing, isSaving }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-4"
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {isEditing ? 'Edit topic' : 'Add new topic'}
      </h3>

      <div className="space-y-3">
        <TopicFormFields form={form} setForm={setForm} />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Add topic'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function NewPathForm({ pathName, setPathName, form, setForm, onSubmit, onCancel, isSaving }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6"
    >
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Create new path
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Path name
          </label>
          <input
            type="text"
            autoFocus
            required
            placeholder="e.g. Rust Basics"
            value={pathName}
            onChange={(e) => setPathName(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <TopicFormFields form={form} setForm={setForm} />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Create path'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function CustomTopicCard({
  topic,
  isLast,
  isConfirmingDelete,
  onToggleComplete,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}) {
  const keyTerms = topic.key_terms
    ? topic.key_terms.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  const wrapperClass = isLast
    ? 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4 flex items-start gap-3'
    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4 mb-3 flex items-start gap-3'

  if (isConfirmingDelete) {
    return (
      <div className={wrapperClass}>
        <div className="flex-1 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">Delete '{topic.title}'?</p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onConfirmDelete}
              className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={onCancelDelete}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <button onClick={onToggleComplete} className="flex-shrink-0 mt-0.5">
        {topic.is_completed ? (
          <span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
            ✓
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600 block" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={
            topic.is_completed
              ? 'font-medium text-gray-400 dark:text-gray-500 line-through mb-1'
              : 'font-medium text-gray-900 dark:text-gray-100 mb-1'
          }
        >
          {topic.title}
        </p>

        {keyTerms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {keyTerms.map((term) => (
              <span
                key={term}
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {topic.learning_outcomes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {topic.learning_outcomes}
          </p>
        )}

        {topic.resource_url && (
          <a
            href={topic.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <i className="ti ti-external-link text-sm" />
            Open Resource
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <i className="ti ti-edit text-base" />
        </button>
        <button
          onClick={onRequestDelete}
          className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <i className="ti ti-trash text-base" />
        </button>
      </div>
    </div>
  )
}

function PathTab({
  pathName,
  isActive,
  isRenaming,
  renameValue,
  onSelect,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  isMenuOpen,
  menuMode,
  onToggleMenu,
  onClickRenameOption,
  onClickDeleteOption,
  onConfirmDeletePath,
  onCancelDeletePath,
}) {
  if (isRenaming) {
    return (
      <div className="flex items-center gap-1.5 pl-3 pr-2 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
        <input
          autoFocus
          type="text"
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameSubmit()
            if (e.key === 'Escape') onRenameCancel()
          }}
          className="text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none w-32"
        />
        <button onClick={onRenameSubmit} className="text-green-600 dark:text-green-400 p-0.5">
          <i className="ti ti-check text-base" />
        </button>
        <button onClick={onRenameCancel} className="text-gray-400 dark:text-gray-500 p-0.5">
          <i className="ti ti-x text-base" />
        </button>
      </div>
    )
  }

  const pillClass = isActive
    ? 'flex items-center rounded-md text-sm font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
    : 'flex items-center rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'

  return (
    <div className="relative group">
      <div className={pillClass}>
        <button type="button" onClick={onSelect} className="pl-4 pr-1.5 py-2 whitespace-nowrap">
          {pathName}
        </button>
        <button
          type="button"
          onClick={onToggleMenu}
          className="pr-2.5 pl-0.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i className="ti ti-dots text-sm" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden z-10">
          {menuMode === 'confirmDelete' ? (
            <div className="p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Delete '{pathName}' and all its topics?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onConfirmDeletePath}
                  className="flex-1 bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={onCancelDeletePath}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={onClickRenameOption}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              >
                <i className="ti ti-edit text-base" />
                Rename path
              </button>
              <button
                onClick={onClickDeleteOption}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 text-left"
              >
                <i className="ti ti-trash text-base" />
                Delete path
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function PathTopicsPanel({
  pathName,
  topics,
  activeForm,
  topicForm,
  setTopicForm,
  isSavingTopic,
  confirmingDeleteId,
  onAddTopic,
  onEditTopic,
  onRequestDeleteTopic,
  onConfirmDeleteTopic,
  onCancelDeleteTopic,
  onToggleComplete,
  onSaveTopic,
  onCancelForm,
}) {
  const completedCount = topics.filter((t) => t.is_completed).length
  const pct = topics.length ? (completedCount / topics.length) * 100 : 0
  const isFormOpenHere = activeForm?.pathName === pathName

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pathName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {completedCount} of {topics.length} complete
          </p>
        </div>
        <button
          onClick={() => onAddTopic(pathName)}
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
        >
          Add Topic
        </button>
      </div>

      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>

      {isFormOpenHere && (
        <TopicForm
          form={topicForm}
          setForm={setTopicForm}
          onSubmit={onSaveTopic}
          onCancel={onCancelForm}
          isEditing={!!activeForm.editingTopicId}
          isSaving={isSavingTopic}
        />
      )}

      {topics.map((topic, index) => (
        <CustomTopicCard
          key={topic.id}
          topic={topic}
          isLast={index === topics.length - 1}
          isConfirmingDelete={confirmingDeleteId === topic.id}
          onToggleComplete={() => onToggleComplete(topic)}
          onEdit={() => onEditTopic(topic)}
          onRequestDelete={() => onRequestDeleteTopic(topic.id)}
          onConfirmDelete={() => onConfirmDeleteTopic(topic)}
          onCancelDelete={onCancelDeleteTopic}
        />
      ))}
    </div>
  )
}

function CustomPathPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPathName, setSelectedPathName] = useState(null)
  const [showNewPathForm, setShowNewPathForm] = useState(false)
  const [newPathName, setNewPathName] = useState('')
  const [activeForm, setActiveForm] = useState(null)
  const [topicForm, setTopicForm] = useState(DEFAULT_TOPIC_FORM)
  const [isSavingTopic, setIsSavingTopic] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [renamingPath, setRenamingPath] = useState(null)
  const [pathMenuOpen, setPathMenuOpen] = useState(null)
  const [pathMenuMode, setPathMenuMode] = useState('menu')
  const pathMenuRef = useRef(null)

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data } = await supabase
        .from('custom_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('path_name')
        .order('sort_order')

      const loadedTopics = data ?? []
      setTopics(loadedTopics)

      const firstPathName = [...new Set(loadedTopics.map((t) => t.path_name))].sort((a, b) =>
        a.localeCompare(b)
      )[0]
      setSelectedPathName(firstPathName ?? null)

      setLoading(false)
    }

    load()
  }, [user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (pathMenuRef.current && !pathMenuRef.current.contains(e.target)) {
        setPathMenuOpen(null)
        setPathMenuMode('menu')
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function selectPath(pathName) {
    setSelectedPathName(pathName)
    setPathMenuOpen(null)
    setPathMenuMode('menu')
    setConfirmingDeleteId(null)
  }

  function openAddTopicForm(pathName) {
    setShowNewPathForm(false)
    setActiveForm({ pathName, editingTopicId: null })
    setTopicForm(DEFAULT_TOPIC_FORM)
    setConfirmingDeleteId(null)
  }

  function openEditTopicForm(topic) {
    setShowNewPathForm(false)
    setActiveForm({ pathName: topic.path_name, editingTopicId: topic.id })
    setTopicForm({
      title: topic.title ?? '',
      keyTerms: topic.key_terms ?? '',
      learningOutcomes: topic.learning_outcomes ?? '',
      resourceUrl: topic.resource_url ?? '',
    })
    setConfirmingDeleteId(null)
  }

  function closeTopicForm() {
    setActiveForm(null)
    setTopicForm(DEFAULT_TOPIC_FORM)
  }

  function handleClickNewPath() {
    setActiveForm(null)
    setTopicForm(DEFAULT_TOPIC_FORM)
    setNewPathName('')
    setShowNewPathForm(true)
    setPathMenuOpen(null)
    setPathMenuMode('menu')
    setRenamingPath(null)
  }

  function closeNewPathForm() {
    setShowNewPathForm(false)
    setNewPathName('')
    setTopicForm(DEFAULT_TOPIC_FORM)
  }

  async function handleCreatePath(e) {
    e.preventDefault()
    const trimmedName = newPathName.trim()
    if (!trimmedName) return

    const nameExists = topics.some(
      (t) => t.path_name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (nameExists) {
      showToast('A path with that name already exists', 'error')
      return
    }

    setIsSavingTopic(true)

    const { data, error } = await supabase
      .from('custom_topics')
      .insert({
        path_name: trimmedName,
        title: topicForm.title,
        key_terms: topicForm.keyTerms || null,
        learning_outcomes: topicForm.learningOutcomes || null,
        resource_url: normalizeResourceUrl(topicForm.resourceUrl),
        user_id: user.id,
        sort_order: 1,
        is_completed: false,
      })
      .select()
      .single()

    setIsSavingTopic(false)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    setTopics((prev) => [...prev, data])
    setSelectedPathName(trimmedName)
    showToast('Topic added to your path', 'success')
    closeNewPathForm()
  }

  async function handleSaveTopic(e) {
    e.preventDefault()
    if (!activeForm) return

    setIsSavingTopic(true)

    const payload = {
      path_name: activeForm.pathName,
      title: topicForm.title,
      key_terms: topicForm.keyTerms || null,
      learning_outcomes: topicForm.learningOutcomes || null,
      resource_url: normalizeResourceUrl(topicForm.resourceUrl),
    }

    if (activeForm.editingTopicId) {
      const { data, error } = await supabase
        .from('custom_topics')
        .update(payload)
        .eq('id', activeForm.editingTopicId)
        .select()
        .single()

      setIsSavingTopic(false)

      if (error) {
        showToast('Something went wrong, please try again', 'error')
        return
      }

      setTopics((prev) => prev.map((t) => (t.id === activeForm.editingTopicId ? data : t)))
      showToast('Topic updated', 'success')
    } else {
      const maxSortOrder = topics
        .filter((t) => t.path_name === activeForm.pathName)
        .reduce((max, t) => Math.max(max, t.sort_order ?? 0), 0)

      const { data, error } = await supabase
        .from('custom_topics')
        .insert({
          ...payload,
          user_id: user.id,
          sort_order: maxSortOrder + 1,
          is_completed: false,
        })
        .select()
        .single()

      setIsSavingTopic(false)

      if (error) {
        showToast('Something went wrong, please try again', 'error')
        return
      }

      setTopics((prev) => [...prev, data])
      showToast('Topic added to your path', 'success')
    }

    closeTopicForm()
  }

  async function handleDeleteTopic(topic) {
    const { error } = await supabase.from('custom_topics').delete().eq('id', topic.id)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    const nextTopics = topics.filter((t) => t.id !== topic.id)
    setTopics(nextTopics)
    setConfirmingDeleteId(null)

    if (
      selectedPathName === topic.path_name &&
      !nextTopics.some((t) => t.path_name === topic.path_name)
    ) {
      const remainingNames = [...new Set(nextTopics.map((t) => t.path_name))].sort((a, b) =>
        a.localeCompare(b)
      )
      setSelectedPathName(remainingNames[0] ?? null)
    }

    showToast('Topic removed', 'success')
  }

  async function handleToggleComplete(topic) {
    const { error } = await supabase
      .from('custom_topics')
      .update({ is_completed: !topic.is_completed })
      .eq('id', topic.id)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    setTopics((prev) =>
      prev.map((t) => (t.id === topic.id ? { ...t, is_completed: !topic.is_completed } : t))
    )

    if (topic.is_completed) {
      showToast('Marked incomplete', 'info')
    } else {
      showToast('Marked complete', 'success')
    }
  }

  function togglePathMenu(pathName) {
    if (pathMenuOpen === pathName) {
      setPathMenuOpen(null)
      setPathMenuMode('menu')
    } else {
      setPathMenuOpen(pathName)
      setPathMenuMode('menu')
    }
  }

  function startRenamingPath(pathName) {
    setPathMenuOpen(null)
    setPathMenuMode('menu')
    setRenamingPath({ pathName, value: pathName })
  }

  async function handleRenamePath() {
    if (!renamingPath) return

    const oldName = renamingPath.pathName
    const newName = renamingPath.value.trim()

    if (!newName || newName === oldName) {
      setRenamingPath(null)
      return
    }

    const { error } = await supabase
      .from('custom_topics')
      .update({ path_name: newName })
      .eq('path_name', oldName)
      .eq('user_id', user.id)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      setRenamingPath(null)
      return
    }

    setTopics((prev) =>
      prev.map((t) => (t.path_name === oldName ? { ...t, path_name: newName } : t))
    )

    if (selectedPathName === oldName) {
      setSelectedPathName(newName)
    }

    setRenamingPath(null)
    showToast('Path renamed', 'success')
  }

  async function handleDeletePath(pathName) {
    const { error } = await supabase
      .from('custom_topics')
      .delete()
      .eq('path_name', pathName)
      .eq('user_id', user.id)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    const nextTopics = topics.filter((t) => t.path_name !== pathName)
    setTopics(nextTopics)

    if (selectedPathName === pathName) {
      const remainingNames = [...new Set(nextTopics.map((t) => t.path_name))].sort((a, b) =>
        a.localeCompare(b)
      )
      setSelectedPathName(remainingNames[0] ?? null)
    }

    setPathMenuOpen(null)
    setPathMenuMode('menu')
    showToast('Path deleted', 'success')
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div
          className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100" />
        </div>
      </>
    )
  }

  const groupedPaths = {}
  for (const topic of topics) {
    if (!groupedPaths[topic.path_name]) {
      groupedPaths[topic.path_name] = []
    }
    groupedPaths[topic.path_name].push(topic)
  }
  const pathNames = Object.keys(groupedPaths).sort((a, b) => a.localeCompare(b))
  const totalCompleted = topics.filter((t) => t.is_completed).length
  const selectedTopics = selectedPathName ? groupedPaths[selectedPathName] ?? [] : []

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <TopBar title="My Learning Paths" />

        <main className="px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              My Learning Paths
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create your own topics and track progress your way
            </p>
          </div>

          {pathNames.length === 0 ? (
            <div className="max-w-md mx-auto">
              {showNewPathForm ? (
                <NewPathForm
                  pathName={newPathName}
                  setPathName={setNewPathName}
                  form={topicForm}
                  setForm={setTopicForm}
                  onSubmit={handleCreatePath}
                  onCancel={closeNewPathForm}
                  isSaving={isSavingTopic}
                />
              ) : (
                <div className="text-center py-20">
                  <i className="ti ti-route text-4xl text-gray-300 dark:text-gray-700 mb-3 inline-block" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                    You haven't created any custom paths yet
                  </p>
                  <button
                    onClick={handleClickNewPath}
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    Create your first path
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {pathNames.length} paths
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {topics.length} topics
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {totalCompleted} completed
                </span>
              </div>

              <div ref={pathMenuRef} className="flex items-center gap-2 flex-wrap mb-6">
                {pathNames.map((pathName) => (
                  <PathTab
                    key={pathName}
                    pathName={pathName}
                    isActive={selectedPathName === pathName}
                    isRenaming={renamingPath?.pathName === pathName}
                    renameValue={renamingPath?.pathName === pathName ? renamingPath.value : ''}
                    onSelect={() => selectPath(pathName)}
                    onRenameChange={(value) => setRenamingPath({ pathName, value })}
                    onRenameSubmit={handleRenamePath}
                    onRenameCancel={() => setRenamingPath(null)}
                    isMenuOpen={pathMenuOpen === pathName}
                    menuMode={pathMenuMode}
                    onToggleMenu={() => togglePathMenu(pathName)}
                    onClickRenameOption={() => startRenamingPath(pathName)}
                    onClickDeleteOption={() => setPathMenuMode('confirmDelete')}
                    onConfirmDeletePath={() => handleDeletePath(pathName)}
                    onCancelDeletePath={() => {
                      setPathMenuOpen(null)
                      setPathMenuMode('menu')
                    }}
                  />
                ))}
                <button
                  onClick={handleClickNewPath}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <i className="ti ti-plus text-base" />
                  New Path
                </button>
              </div>

              {showNewPathForm && (
                <NewPathForm
                  pathName={newPathName}
                  setPathName={setNewPathName}
                  form={topicForm}
                  setForm={setTopicForm}
                  onSubmit={handleCreatePath}
                  onCancel={closeNewPathForm}
                  isSaving={isSavingTopic}
                />
              )}

              {selectedPathName && (
                <PathTopicsPanel
                  pathName={selectedPathName}
                  topics={selectedTopics}
                  activeForm={activeForm}
                  topicForm={topicForm}
                  setTopicForm={setTopicForm}
                  isSavingTopic={isSavingTopic}
                  confirmingDeleteId={confirmingDeleteId}
                  onAddTopic={openAddTopicForm}
                  onEditTopic={openEditTopicForm}
                  onRequestDeleteTopic={setConfirmingDeleteId}
                  onConfirmDeleteTopic={handleDeleteTopic}
                  onCancelDeleteTopic={() => setConfirmingDeleteId(null)}
                  onToggleComplete={handleToggleComplete}
                  onSaveTopic={handleSaveTopic}
                  onCancelForm={closeTopicForm}
                />
              )}
            </>
          )}
        </main>
      </div>
    </>
  )
}

export default CustomPathPage
