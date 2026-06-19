import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

const FEATURES = [
  '3-phase Gen AI curriculum',
  'Daily habit tracker with streaks',
  'Progress dashboard with charts',
]

function SignupPage() {
  const { showToast } = useToast()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    setLoading(false)

    if (error) {
      setError(error.message || 'Something went wrong. Please try again.')
      showToast('Signup failed', 'error')
      return
    }

    setSuccess(true)
    showToast('Account created! Check your email to confirm.', 'success')
  }

  return (
    <div className="flex flex-row h-screen">
      <div className="hidden md:flex flex-1 bg-gray-900 text-white items-center justify-center px-12">
        <div className="max-w-sm">
          <p className="text-3xl font-bold leading-snug">
            Track your learning. Build your habits. Level up daily.
          </p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                  <i className="ti ti-check text-xs" />
                </span>
                {feature}
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm mt-12">Levelpath · by Veera</p>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="max-w-sm w-full px-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1 mb-8">Start your Gen AI learning journey</p>

          {success ? (
            <p className="text-sm text-green-600">Check your email to confirm your account.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1 block">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={
                  loading
                    ? 'w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium mt-6 opacity-70 cursor-not-allowed'
                    : 'w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium mt-6 hover:bg-gray-700'
                }
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
