'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { log } from '@repo/utils/logger'
import { serverCheck } from '@/lib/utils/server-check'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, AudioLines } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoInView, setVideoInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            videoRef.current.play()
          }
          setVideoInView(true)
        } else {
          if (videoRef.current) {
            videoRef.current.pause()
          }
          setVideoInView(false)
        }
      })
    }, { threshold: 0.5 })

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  const features = [
    {
      title: 'Real-time recording transcriptions',
      description: 'Capture audio instantly or upload your files. Start transcribing within seconds. Convert speech to text with industry-leading accuracy. Support for multiple languages.',
      image: '/images/feature-recording.png',
    },
    {
      title: 'Summaries & Highlights & Event detect',
      description: 'Automatically extract key points, highlights and events from your conversations effortlessly.',
      image: '/images/feature-summary.png',
    },
    {
      title: 'Google Calendar Integration',
      description: 'Extract dates and events, then push them directly to your Google Calendar.',
      image: '/images/feature-calendar.png',
    },
  ]

  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    wakingUpServer()
  }, [])

  async function wakingUpServer() {
    try {
      await serverCheck()
    } catch (error) {
      log.error('Server is not reachable:', error)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      router.push('/home')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="w-full relative bg-gray-50">
        <div className="pointer-events-none absolute bottom-0 right-0 overflow-hidden lg:inset-y-0 z-0">
          <img
            className="w-auto h-full  object-fill"
            src="https://d33wubrfki0l68.cloudfront.net/1e0fc04f38f5896d10ff66824a62e466839567f8/699b5/images/hero/3/background-pattern.png"
            alt=""
          />
        </div>

        <header className="relative py-4 md:py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <a
                  href="#"
                  title=""
                  className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                >
                  <span className="text-3xl italic font-bold w-auto h-8">
                    MeetingMind
                  </span>
                </a>
              </div>

              <div className="flex lg:hidden">
                <button type="button" className="text-gray-900">
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="hidden lg:flex lg:ml-16 lg:items-center lg:justify-center lg:space-x-10">
                <div className="flex items-center space-x-12">
                  <a
                    href="#features"
                    title=""
                    className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    {' '}
                    Features{' '}
                  </a>

                  {/*
                  <a
                    href="#"
                    title=""
                    className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    {' '}
                    Pricing{' '}
                  </a>

                  <a
                    href="#"
                    title=""
                    className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    {' '}
                    Automation{' '}
                  </a>
                  */}
                </div>

                <div className="w-px h-5 bg-gray-300"></div>

                <a
                  href="/auth/login"
                  title=""
                  className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {' '}
                  Login{' '}
                </a>

                <a
                  href="/auth/signup"
                  title=""
                  className="px-5 py-2 text-base font-semibold leading-7 text-gray-900 transition-all duration-200 bg-transparent border border-gray-900 rounded-xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 hover:text-white focus:bg-gray-900 focus:text-white"
                  role="button"
                >
                  Create free account
                </a>
              </div>
            </div>
          </div>
        </header>

        <section className="relative py-12 sm:py-16 lg:pt-20 lg:pb-36">
          <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 gap-y-8 lg:items-center lg:grid-cols-2 sm:gap-y-20 xl:grid-cols-5">
              <div className="text-center xl:col-span-2 lg:text-left md:px-16 lg:px-0">
                <div className="max-w-sm mx-auto sm:max-w-md md:max-w-full">
                  <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:text-[3.25rem] lg:leading-tight font-pj">
                    Turn every meeting into searchable, shareable notes.
                  </h1>

                  <div className="mt-8 lg:mt-12 lg:flex lg:items-center">
                    <div className="flex justify-center flex-shrink-0 -space-x-4 overflow-hidden lg:justify-start">
                      {/*
                      <img
                        className="inline-block rounded-full w-14 h-14 ring-2 ring-white"
                        src="https://d33wubrfki0l68.cloudfront.net/3bfa6da479d6b9188c58f2d9a8d33350290ee2ef/301f1/images/hero/3/avatar-male.png"
                        alt=""
                      />
                      <img
                        className="inline-block rounded-full w-14 h-14 ring-2 ring-white"
                        src="https://d33wubrfki0l68.cloudfront.net/b52fa09a115db3a80ceb2d52c275fadbf84cf8fc/7fd8a/images/hero/3/avatar-female-1.png"
                        alt=""
                      />
                      <img
                        className="inline-block rounded-full w-14 h-14 ring-2 ring-white"
                        src="https://d33wubrfki0l68.cloudfront.net/8a2efb13f103a5ae2909e244380d73087a9c2fc4/31ed6/images/hero/3/avatar-female-2.png"
                        alt=""
                      />
                    */}
                    </div>

                    <p className="mt-4 text-lg text-gray-900 lg:mt-0 lg:ml-0 font-pj">
                      Automatically{' '}
                      <span className="font-bold">
                        transcribe, summarize, and organize{' '}
                      </span>
                      your conversations in seconds.
                    </p>
                  </div>
                </div>

                <div className="mt-8 sm:flex sm:items-center sm:justify-center lg:justify-start sm:space-x-5 lg:mt-12">
                  <a
                    href="/home"
                    title=""
                    className="inline-flex items-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 font-pj justif-center hover:bg-blue-800"
                    role="button"
                  >
                    Get started free
                  </a>
                  {/*
                  <a
                    href="#"
                    title=""
                    className="inline-flex items-center px-4 py-4 mt-4 text-lg font-bold transition-all duration-200 bg-transparent border border-transparent sm:mt-0 font-pj justif-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 hover:bg-gray-200 focus:bg-gray-200"
                    role="button"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      ></path>
                    </svg>
                    Download iOS App
                  </a>
                  */}
                </div>
              </div>

              <div className="xl:col-span-3">
                <img
                  className="w-full mx-auto scale-110"
                  src="images/mockup-image.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>
        <section className="select-text py-20 px-4 sm:px-6 lg:px-8 ">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">See It In Action</h2>
              <p className="text-lg ">
                Watch how MeetingMind transforms your conversations into actionable insights in minutes.
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-border  shadow-2xl">
              <video
                ref={videoRef}
                className="w-full object-cover"
                muted
                loop
                playsInline
              >
                <source src="https://jxukugqnomwzfpqsbbez.supabase.co/storage/v1/object/public/cms/transcript-tab-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <p className="text-center text-muted-foreground mt-6 text-sm">
              Transcription with audio playback control.
            </p>
          </div>
        </section>

        <section id="features" className="py-20 px-4 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Empower Your Workflow with AI</h2>
              <p className="text-lg  max-w-2xl mx-auto">
                Comprehensive features designed to transform how you work with audio and conversations.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {features.map((feature, index) => {
                return (
                  <div
                    key={index}
                    className="bg-backdrop-blur-lg rounded-2xl p-4 bg-white/99 flex flex-col group"
                  >
                    {/* Image */}
                    <div className="relative rounded-lg overflow-hidden mb-4 h-[350px]">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                      </div>

                      <p className="text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>


        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-lg  mb-8">
              Join hundreds of professionals who are already using MeetingMind to turn conversations into insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="gap-2 hover:cursor-pointer">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border bg-black/90 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
                    <AudioLines className="w-6 h-6 " />
                  </div>
                  <span className="font-bold text-lg">MeetingMind</span>
                </div>
                <p className="text-sm">
                  Transform conversations into insights with AI-powered transcription and meeting intelligence.
                </p>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-muted-foreground  hover:text-muted-hover-foreground transition text-sm">Features</Link></li>
                  <li><Link href="#demo" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Demo</Link></li>
                  {/*
                   
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Pricing</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Security</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-dark-foreground transition text-sm">Roadmap</Link></li>
                   */}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  {/*
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">About</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Blog</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Careers</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Contact</Link></li>
                   */}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  {/*
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Privacy</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Terms</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Cookies</Link></li>
                  <li><Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition text-sm">Status</Link></li>
                   */}
                </ul>
              </div>

            </div>


            {/* Bottom Footer */}
            <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">© 2026 MeetingMind. All rights reserved.</p>
              <div className="flex gap-6">
                {/* 

                  <Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </Link>
                  <Link href="#" className="text-muted-foreground  hover:text-bg-dark-foreground transition">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.292-1.39-2.292-1.391 0-1.609 1.086-1.609 2.202v4.268h-2.668V9.309h2.56v1.17h.036c.357-.675 1.228-1.387 2.528-1.387 2.703 0 3.203 1.778 3.203 4.092v4.386zM5.337 7.433c-.86 0-1.551-.698-1.551-1.563 0-.865.692-1.563 1.551-1.563.859 0 1.551.698 1.551 1.563 0 .865-.692 1.563-1.551 1.563zm1.333 9.905H3.667V9.309h2.003v7.922zM17.668 1H2.331C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.331 19h15.338c.735 0 1.331-.582 1.331-1.299V2.298C19 1.581 18.403 1 17.668 1z" clipRule="evenodd" /></svg>
                  </Link>
               */}
                <Link href="https://github.com/Phuocthinhkkk" className="text-muted-foreground  hover:text-bg-dark-foreground transition">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.186.092-.923.349-1.543.635-1.897-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.48C17.137 18.195 20 14.44 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div >

    </div >
  )
}
