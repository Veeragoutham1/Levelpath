import { useEffect, useState } from 'react'
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

function TopicFormFields({ form, setForm }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Key Terms</label>
        <input
          type="text"
          placeholder="comma, separated, terms"
          value={form.keyTerms}
          onChange={(e) => setForm((prev) => ({ ...prev, keyTerms: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Learning Outcomes</label>
        <textarea
          rows={2}
          value={form.learningOutcomes}
          onChange={(e) => setForm((prev) => ({ ...prev, learningOutcomes: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
        <input
          type="text"
          placeholder="https://..."
          value={form.resourceUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, resourceUrl: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>
    </>
  )
}

function TopicForm({ form, setForm, onSubmit, onCancel, isEditing }) {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {isEditing ? 'Edit topic' : 'Add new topic'}
      </h3>

      <div className="space-y-3">
        <TopicFormFields form={form} setForm={setForm} />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          {isEditing ? 'Save changes' : 'Add topic'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function NewPathForm({ pathName, setPathName, form, setForm, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Create new path</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Path name</label>
          <input
            type="text"
            autoFocus
            required
            placeholder="e.g. Rust Basics"
            value={pathName}
            onChange={(e) => setPathName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <TopicFormFields form={form} setForm={setForm} />
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Create path
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function CustomTopicCard({ topic, isLast, onToggleComplete, onEdit, onDelete }) {
  const keyTerms = topic.key_terms
    ? topic.key_terms.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <div
      className={
        isLast
          ? 'bg-white border border-gray-100 rounded-lg p-4 flex items-start gap-3'
          : 'bg-white border border-gray-100 rounded-lg p-4 mb-3 flex items-start gap-3'
      }
    >
      <button onClick={onToggleComplete} className="flex-shrink-0 mt-0.5">
        {topic.is_completed ? (
          <span className="h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
            ✓
          </span>
        ) : (
          <span className="h-5 w-5 rounded-full border border-gray-300 block" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={
            topic.is_completed
              ? 'font-medium text-gray-400 line-through mb-1'
              : 'font-medium text-gray-900 mb-1'
          }
        >
          {topic.title}
        </p>

        {keyTerms.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {keyTerms.map((term) => (
              <span
                key={term}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {topic.learning_outcomes && (
          <p className="text-sm text-gray-500 mb-2">{topic.learning_outcomes}</p>
        )}

        {topic.resource_url && (
          <a
            href={topic.resource_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 hover:bg-gray-50"
          >
            <i className="ti ti-external-link text-sm" />
            Open Resource
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-50"
        >
          <i className="ti ti-edit text-base" />
        </button>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-50"
        >
          <i className="ti ti-trash text-base" />
        </button>
      </div>
    </div>
  )
}

function PathSection({
  pathName,
  topics,
  activeForm,
  topicForm,
  setTopicForm,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onToggleComplete,
  onSaveTopic,
  onCancelForm,
}) {
  const completedCount = topics.filter((t) => t.is_completed).length
  const pct = topics.length ? (completedCount / topics.length) * 100 : 0
  const isFormOpenHere = activeForm?.pathName === pathName

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{pathName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedCount} of {topics.length} complete
          </p>
        </div>
        <button
          onClick={() => onAddTopic(pathName)}
          className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Add Topic
        </button>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3 mb-6">
        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>

      {isFormOpenHere && (
        <TopicForm
          form={topicForm}
          setForm={setTopicForm}
          onSubmit={onSaveTopic}
          onCancel={onCancelForm}
          isEditing={!!activeForm.editingTopicId}
        />
      )}

      {topics.map((topic, index) => (
        <CustomTopicCard
          key={topic.id}
          topic={topic}
          isLast={index === topics.length - 1}
          onToggleComplete={() => onToggleComplete(topic)}
          onEdit={() => onEditTopic(topic)}
          onDelete={() => onDeleteTopic(topic.id)}
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
  const [showNewPathForm, setShowNewPathForm] = useState(false)
  const [newPathName, setNewPathName] = useState('')
  const [activeForm, setActiveForm] = useState(null)
  const [topicForm, setTopicForm] = useState(DEFAULT_TOPIC_FORM)

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data } = await supabase
        .from('custom_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('path_name')
        .order('sort_order')

      setTopics(data ?? [])
      setLoading(false)
    }

    load()
  }, [user])

  function openAddTopicForm(pathName) {
    setShowNewPathForm(false)
    setActiveForm({ pathName, editingTopicId: null })
    setTopicForm(DEFAULT_TOPIC_FORM)
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

    const { data, error } = await supabase
      .from('custom_topics')
      .insert({
        path_name: trimmedName,
        title: topicForm.title,
        key_terms: topicForm.keyTerms || null,
        learning_outcomes: topicForm.learningOutcomes || null,
        resource_url: topicForm.resourceUrl || null,
        user_id: user.id,
        sort_order: 1,
        is_completed: false,
      })
      .select()
      .single()

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    setTopics((prev) => [...prev, data])
    showToast('Topic added to your path', 'success')
    closeNewPathForm()
  }

  async function handleSaveTopic(e) {
    e.preventDefault()
    if (!activeForm) return

    const payload = {
      path_name: activeForm.pathName,
      title: topicForm.title,
      key_terms: topicForm.keyTerms || null,
      learning_outcomes: topicForm.learningOutcomes || null,
      resource_url: topicForm.resourceUrl || null,
    }

    if (activeForm.editingTopicId) {
      const { data, error } = await supabase
        .from('custom_topics')
        .update(payload)
        .eq('id', activeForm.editingTopicId)
        .select()
        .single()

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

      if (error) {
        showToast('Something went wrong, please try again', 'error')
        return
      }

      setTopics((prev) => [...prev, data])
      showToast('Topic added to your path', 'success')
    }

    closeTopicForm()
  }

  async function handleDeleteTopic(topicId) {
    const { error } = await supabase.from('custom_topics').delete().eq('id', topicId)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    setTopics((prev) => prev.filter((t) => t.id !== topicId))
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

  if (loading) {
    return (
      <>
        <Sidebar />
        <div
          className="min-h-screen bg-gray-50 flex items-center justify-center"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
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
  const pathNames = Object.keys(groupedPaths)

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <TopBar title="My Learning Paths" />

        <main className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Learning Paths</h1>
              <p className="text-gray-500 mt-1">
                Create your own topics and track progress your way
              </p>
            </div>
            <button
              onClick={handleClickNewPath}
              className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
            >
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
            />
          )}

          {pathNames.length === 0 && !showNewPathForm ? (
            <div className="text-center py-20">
              <i className="ti ti-route text-4xl text-gray-300 mb-3 inline-block" />
              <p className="text-gray-400 text-sm mb-4">
                You haven't created any custom paths yet
              </p>
              <button
                onClick={handleClickNewPath}
                className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Create your first path
              </button>
            </div>
          ) : (
            pathNames.map((pathName) => (
              <PathSection
                key={pathName}
                pathName={pathName}
                topics={groupedPaths[pathName]}
                activeForm={activeForm}
                topicForm={topicForm}
                setTopicForm={setTopicForm}
                onAddTopic={openAddTopicForm}
                onEditTopic={openEditTopicForm}
                onDeleteTopic={handleDeleteTopic}
                onToggleComplete={handleToggleComplete}
                onSaveTopic={handleSaveTopic}
                onCancelForm={closeTopicForm}
              />
            ))
          )}
        </main>
      </div>
    </>
  )
}

export default CustomPathPage
