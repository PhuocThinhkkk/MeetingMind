'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import GoogleSignInButton from '@/components/google-btn-sign-in'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const { signUp } = useAuth()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name
      )
      if (error) {
        setError(error.message)
      } else {
        setShowVerification(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (showVerification) {
    return <VerificationMessage email={formData.email} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Join us today
          </h1>
          <p className="text-muted-foreground">
            Create your meeting transcription account
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-slide-up hover-lift">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className="pl-10 transition-all focus:scale-[1.02] hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="pl-10 transition-all focus:scale-[1.02] hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                    className="pl-10 transition-all focus:scale-[1.02] hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={e =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    className="pl-10 transition-all focus:scale-[1.02] hover:shadow-md"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <GoogleSignInButton />

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:opacity-80 font-medium transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Displays a post-signup screen instructing the user to check their email for a verification link.
 *
 * @param email - The email address that received the verification link
 * @returns The verification message UI with instructions and a button to return to the sign-in page
 */
function VerificationMessage({ email }: { email: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-scale-in hover-lift">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse text-primary-foreground">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Check your email
              </h2>
              <p className="text-muted-foreground mb-6">
                We have sent a verification link to <strong>{email}</strong>
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">
                    Click the link in the email to verify your account and
                    complete the setup.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="w-full transition-all hover:scale-[1.02] hover:shadow-md"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
