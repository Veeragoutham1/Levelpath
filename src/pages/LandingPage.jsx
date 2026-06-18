import { Link, useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: 'ti-books',
    iconBgClass: 'bg-blue-50',
    iconTextClass: 'text-blue-600',
    title: 'Structured Learning Plan',
    description:
      'Follow a 3-phase Gen AI curriculum covering LLMs, Agentic Development, RAG, and MCP. Mark topics complete and track your progress.',
  },
  {
    icon: 'ti-checkbox',
    iconBgClass: 'bg-green-50',
    iconTextClass: 'text-green-600',
    title: 'Daily Task Tracker',
    description:
      'Create daily habits with Yes/No tracking, streak counters, priority levels, and day exclusions. Never lose track of what matters.',
  },
  {
    icon: 'ti-chart-bar',
    iconBgClass: 'bg-purple-50',
    iconTextClass: 'text-purple-600',
    title: 'Progress Dashboard',
    description:
      'See your weekly completion charts, learning progress by phase, and streak stats — all in one clean dashboard.',
  },
  {
    icon: 'ti-flame',
    iconBgClass: 'bg-orange-50',
    iconTextClass: 'text-orange-500',
    title: 'Streak Tracking',
    description:
      'Build momentum with per-task streak counters. Every day you complete a task, your streak grows. Miss a day, start fresh.',
  },
  {
    icon: 'ti-shield',
    iconBgClass: 'bg-gray-100',
    iconTextClass: 'text-gray-600',
    title: 'Admin Overview',
    description:
      "Admins can see all users' progress, topic completion rates, and recent activity across the platform.",
  },
  {
    icon: 'ti-heart',
    iconBgClass: 'bg-pink-50',
    iconTextClass: 'text-pink-500',
    title: 'Completely Free',
    description: 'Built as a personal project. No subscriptions, no paywalls. Just sign up and start learning.',
  },
]

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

function FeatureCard({ icon, iconBgClass, iconTextClass, title, description }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-sm transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconBgClass}`}>
        <i className={`ti ${icon} text-xl ${iconTextClass}`} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  )
}

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-white min-h-screen">
      <nav className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-gray-900">Levelpath</span>
          <span className="text-sm text-gray-500 ml-2">by Veera</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-8">
        <div className="flex justify-center mb-6">
          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100">
            Gen AI Learning + Productivity
          </span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 text-center leading-tight">
          Track your learning.
          <br />
          Build your habits.
          <br />
          Level up daily.
        </h1>

        <p className="text-xl text-gray-500 text-center max-w-2xl mx-auto mt-6">
          A personal platform to track your Gen AI learning journey and build daily habits — with
          streaks, progress charts, and a structured 3-phase curriculum.
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          <button
            onClick={() => navigate('/signup')}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-gray-800"
          >
            Start for free
          </button>
          <button
            onClick={scrollToFeatures}
            className="border border-gray-300 px-8 py-3 rounded-xl text-base text-gray-700 hover:bg-gray-50"
          >
            See how it works
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Free to use · No credit card required
        </p>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Everything you need to level up
        </h2>
        <p className="text-gray-500 text-center mt-3">
          Built for learners who want structure, accountability, and progress
        </p>

        <div className="grid grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto px-8">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Ready to start your Gen AI journey?</h2>
        <p className="text-gray-500 mt-3">
          Join Levelpath and track your path from AI basics to production-ready agents.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-gray-800"
        >
          Create free account
        </button>
      </section>

      <footer className="border-t border-gray-200 py-8 px-8 flex items-center justify-between">
        <span className="text-sm text-gray-400">Levelpath · Built by Veera Goutham</span>
        <span className="text-sm text-gray-400">Made with React + Supabase</span>
      </footer>
    </div>
  )
}

export default LandingPage
