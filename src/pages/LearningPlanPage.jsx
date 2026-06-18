import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const PHASE_NAMES = {
  1: 'Phase 1 — AI Basics',
  2: 'Phase 2 — Agentic Development',
  3: 'Phase 3 — Advanced RAG & Deployment',
}

function ChevronDownIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function SidebarTopicItem({ topic, isCompleted, isActive, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={
        isActive
          ? 'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left bg-blue-50 border-l-2 border-l-blue-500'
          : 'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left border-l-2 border-l-transparent hover:bg-gray-50'
      }
    >
      {isCompleted ? (
        <span className="flex-shrink-0 h-4 w-4 rounded-full bg-green-500 text-white text-[10px] leading-none flex items-center justify-center">
          ✓
        </span>
      ) : (
        <span className="flex-shrink-0 h-4 w-4 rounded-full border border-gray-300" />
      )}

      <span
        className={
          isCompleted
            ? 'flex-1 truncate text-sm text-gray-400 line-through'
            : 'flex-1 truncate text-sm text-gray-900'
        }
      >
        {topic.title}
      </span>

      {!topic.is_mandatory && (
        <span className="flex-shrink-0 text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
          opt
        </span>
      )}
    </button>
  )
}

function TopicDetail({ topic, isCompleted, onToggleComplete }) {
  if (!topic) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">← Select a topic from the sidebar to get started</p>
      </div>
    )
  }

  const keyTerms = topic.key_terms ? topic.key_terms.split(',').map((term) => term.trim()) : []

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
          <span
            className={
              topic.is_mandatory
                ? 'shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700'
                : 'shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600'
            }
          >
            {topic.is_mandatory ? 'Mandatory' : 'Optional'}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {PHASE_NAMES[topic.phase] ?? ''} · {topic.effort_hours} hrs
        </p>

        <div className="border-t border-gray-200 my-6" />

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Key Terms
          </p>
          <div className="flex flex-wrap gap-2">
            {keyTerms.map((term) => (
              <span
                key={term}
                className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full"
              >
                {term}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Learning Outcomes
          </p>
          <p className="text-base text-gray-700 leading-relaxed">{topic.learning_outcomes}</p>
        </div>

        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Resources
          </p>
          <div className="flex flex-wrap gap-3">
            {topic.video_url && (
              <a
                href={topic.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Watch / Read
              </a>
            )}
            {topic.practice_url && (
              <a
                href={topic.practice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Practice
              </a>
            )}
            {topic.additional_resources && (
              <a
                href={topic.additional_resources}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Extra Resources
              </a>
            )}
          </div>
        </div>

        <button
          onClick={onToggleComplete}
          className={
            isCompleted
              ? 'w-full bg-green-500 text-white text-base font-medium py-3 rounded-md hover:bg-green-600 transition-colors'
              : 'w-full bg-gray-900 text-white text-base font-medium py-3 rounded-md hover:bg-gray-800 transition-colors'
          }
        >
          {isCompleted ? '✓ Completed' : 'Mark Complete'}
        </button>
      </div>
    </div>
  )
}

function LearningPlanPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [completedTopicIds, setCompletedTopicIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedTopicId, setSelectedTopicId] = useState(null)
  const [collapsedPhases, setCollapsedPhases] = useState(new Set())

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      const [topicsRes, progressRes] = await Promise.all([
        supabase.from('topics').select('*').order('phase').order('sort_order'),
        supabase.from('user_progress').select('topic_id').eq('user_id', user.id),
      ])

      const topicsData = topicsRes.data ?? []
      const completedIds = new Set((progressRes.data ?? []).map((row) => String(row.topic_id)))

      setTopics(topicsData)
      setCompletedTopicIds(completedIds)

      const firstIncompleteMandatory = topicsData.find(
        (t) => t.is_mandatory && !completedIds.has(String(t.id))
      )
      setSelectedTopicId((firstIncompleteMandatory ?? topicsData[0])?.id ?? null)

      setLoading(false)
    }

    fetchData()
  }, [user])

  function togglePhaseCollapsed(phaseNumber) {
    setCollapsedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseNumber)) {
        next.delete(phaseNumber)
      } else {
        next.add(phaseNumber)
      }
      return next
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleToggleComplete(topicId) {
    const isCompleted = completedTopicIds.has(String(topicId))

    setCompletedTopicIds((prev) => {
      const next = new Set(prev)
      if (isCompleted) {
        next.delete(String(topicId))
      } else {
        next.add(String(topicId))
      }
      return next
    })

    if (isCompleted) {
      await supabase.from('user_progress').delete().eq('user_id', user.id).eq('topic_id', topicId)
    } else {
      await supabase.from('user_progress').insert({ user_id: user.id, topic_id: topicId })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      </div>
    )
  }

  const completedCount = completedTopicIds.size
  const phaseNumbers = [...new Set(topics.map((t) => t.phase))].sort((a, b) => a - b)
  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null

  return (
    <div className="h-screen flex flex-col">
      <nav className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">Levelpath</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[300px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Your Progress
            </p>
            <p className="text-sm text-gray-700 mb-2">
              {completedCount} of {topics.length} topics completed
            </p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all"
                style={{ width: `${topics.length ? (completedCount / topics.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {phaseNumbers.map((phaseNumber) => {
            const phaseTopics = topics.filter((t) => t.phase === phaseNumber)
            const phaseCompletedCount = phaseTopics.filter((t) =>
              completedTopicIds.has(String(t.id))
            ).length
            const isCollapsed = collapsedPhases.has(phaseNumber)

            return (
              <div key={phaseNumber} className="border-b border-gray-100">
                <button
                  onClick={() => togglePhaseCollapsed(phaseNumber)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 text-left"
                >
                  <span className="text-sm font-bold text-gray-900">
                    {PHASE_NAMES[phaseNumber] ?? `Phase ${phaseNumber}`}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">
                      {phaseCompletedCount}/{phaseTopics.length}
                    </span>
                    {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="flex flex-col gap-1 px-4 pb-3">
                    {phaseTopics.map((topic) => (
                      <SidebarTopicItem
                        key={topic.id}
                        topic={topic}
                        isCompleted={completedTopicIds.has(String(topic.id))}
                        isActive={selectedTopicId === topic.id}
                        onSelect={() => setSelectedTopicId(topic.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </aside>

        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <TopicDetail
            topic={selectedTopic}
            isCompleted={selectedTopic ? completedTopicIds.has(String(selectedTopic.id)) : false}
            onToggleComplete={() => selectedTopic && handleToggleComplete(selectedTopic.id)}
          />
        </main>
      </div>
    </div>
  )
}

export default LearningPlanPage
