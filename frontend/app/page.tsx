'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { blogPosts } from '@/lib/blog'
import { profile } from '@/lib/profile'

export default function Home() {
  const latestBlogPosts = blogPosts.slice(0, 3)
  const [scrollY, setScrollY] = useState(0)
  const [hackText, setHackText] = useState(profile.name)
  const [isHacking, setIsHacking] = useState(false)
  const [githubHighlights, setGithubHighlights] = useState<
    Array<{ id: string; title: string; repo?: string; url?: string; createdAt: string }>
  >([])
  const [githubStatus, setGithubStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [spotifyStatus, setSpotifyStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [spotifyNowPlaying, setSpotifyNowPlaying] = useState<{
    configured: boolean
    isPlaying?: boolean
    track?: string | null
    artists?: string[]
    url?: string | null
    albumImage?: string | null
    message?: string
  } | null>(null)
  const [spotifyRecentlyPlayed, setSpotifyRecentlyPlayed] = useState<{
    configured: boolean
    items?: Array<{
      id: string | null
      track: string | null
      artists: string[]
      url: string | null
      playedAt: string | null
    }>
    error?: string
    message?: string
  } | null>(null)
  const [spotifyTopTracks, setSpotifyTopTracks] = useState<{
    configured: boolean
    timeRange?: string
    items?: Array<{
      id: string | null
      track: string | null
      artists: string[]
      url: string | null
    }>
    error?: string
    message?: string
  } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    startHackEffect()
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setGithubStatus('loading')
      try {
        const res = await fetch(`/api/github?username=${encodeURIComponent(profile.githubUsername)}`)
        if (!res.ok) throw new Error('github')
        const data = await res.json()
        if (cancelled) return
        setGithubHighlights(data?.highlights ?? [])
        setGithubStatus('ready')
      } catch {
        if (cancelled) return
        setGithubStatus('error')
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setSpotifyStatus('loading')
      try {
        const [nowRes, recentRes, topRes] = await Promise.all([
          fetch('/api/spotify/now-playing', { cache: 'no-store' }),
          fetch('/api/spotify/recently-played?limit=5', { cache: 'no-store' }),
          fetch('/api/spotify/top-tracks?limit=10&time_range=short_term', { cache: 'no-store' }),
        ])
        if (!nowRes.ok) throw new Error('spotify')
        const [nowData, recentData, topData] = await Promise.all([
          nowRes.json(),
          recentRes.ok
            ? recentRes.json()
            : Promise.resolve({ configured: true, error: `Spotify API error (${recentRes.status})` }),
          topRes.ok
            ? topRes.json()
            : Promise.resolve({ configured: true, error: `Spotify API error (${topRes.status})` }),
        ])
        if (cancelled) return
        setSpotifyNowPlaying(nowData)
        setSpotifyRecentlyPlayed(recentData)
        setSpotifyTopTracks(topData)
        setSpotifyStatus('ready')
      } catch {
        if (cancelled) return
        setSpotifyStatus('error')
      }
    }
    run()
    const interval = setInterval(run, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const startHackEffect = () => {
    if (isHacking) return
    setIsHacking(true)
    
    const originalText = profile.name
    const chars = '01!@#$%^&*(){}[]<>?/\\|~`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let iterations = 0
    
    const interval = setInterval(() => {
      setHackText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iterations) {
              return originalText[index]
            }
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      )
      
      iterations += 0.15
      
      if (iterations >= originalText.length) {
        clearInterval(interval)
        setHackText(originalText)
        setIsHacking(false)
      }
    }, 60)
  }

  const resetText = () => {
    if (!isHacking) {
      setHackText(profile.name)
    }
  }

  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const scrollProgress = Math.min(scrollY / heroHeight, 1)
  
  const imageScale = Math.max(0.65, 1 - (scrollProgress * 0.35))
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const imageTranslateY = 0
  const imageTranslateX = isMobile ? (-scrollProgress * 30) : 0
  
  const navMinimizeThreshold = 260
  const navFadeProgress = Math.min(1, Math.max(0, (scrollY - 180) / 220))
  const navOpacity = 1 - (navFadeProgress * 0.12)
  const isNavMinimized = scrollY > navMinimizeThreshold

  const contactSection = typeof document !== 'undefined' ? document.querySelector('#contact') : null
  const contactSectionTop = contactSection?.getBoundingClientRect().top ?? Infinity
  const isInContactSection = contactSectionTop <= 100
  
  const navTextColor = isInContactSection ? 'text-white' : 'text-foreground'
  const navMinimizedTone = isInContactSection
    ? 'bg-black/70 border-white/20 shadow-black/40'
    : 'bg-white/85 border-gray-200 shadow-gray-900/10'
  const navButtonTone = isInContactSection
    ? 'text-white hover:bg-white/10'
    : 'text-foreground hover:bg-gray-100'
  const navMinimizedLinkTone = isInContactSection
    ? 'hover:bg-white/10'
    : 'hover:bg-black/5'

  const revealStyle = (startY: number) => {
    const t = scrollY - startY
    const opacity = Math.min(1, Math.max(0, t / 200))
    const translateY = Math.max(0, 40 - t / 10)
    return { opacity, transform: `translateY(${translateY}px)` }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }
  
  const heroContentOpacity = Math.max(0, 1 - (scrollProgress * 2))

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-white">
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] bg-black text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-5 h-5 md:w-6 md:h-6"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>

      <nav
        className={`fixed top-4 md:top-8 right-4 md:right-8 lg:right-16 z-[2147483647] transition-opacity duration-300 pointer-events-auto ${
          isNavMinimized
            ? `group/menu backdrop-blur-md border rounded-xl p-2 shadow-xl ${navMinimizedTone}`
            : ''
        }`}
        style={{ opacity: navOpacity }}
        aria-label="Main navigation"
      >
        {isNavMinimized ? (
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${navButtonTone}`}
            aria-label="Open navigation menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        ) : null}
        <div
          className={`flex flex-col items-end transition-all duration-300 ${
            isNavMinimized
              ? 'gap-1 max-h-0 opacity-0 overflow-hidden pointer-events-none group-hover/menu:max-h-[520px] group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto group-focus-within/menu:max-h-[520px] group-focus-within/menu:opacity-100 group-focus-within/menu:pointer-events-auto'
              : 'gap-1 md:gap-4'
          }`}
        >
        <Link 
          href="#home" 
          onClick={(e) => handleNavClick(e, '#home')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          Home
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        <Link 
          href="#about" 
          onClick={(e) => handleNavClick(e, '#about')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          About
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        <Link 
          href="#services" 
          onClick={(e) => handleNavClick(e, '#services')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          Background
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        <Link
          href="#activity"
          onClick={(e) => handleNavClick(e, '#activity')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          Activity
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        <Link
          href="#feedback"
          onClick={(e) => handleNavClick(e, '#feedback')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          Feedback from work
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        <Link
          href="#blog"
          onClick={(e) => handleNavClick(e, '#blog')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          Blog
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        <Link 
          href="#contact" 
          onClick={(e) => handleNavClick(e, '#contact')}
          className={`font-bold ${navTextColor} hover:opacity-70 transition-all relative group/link pointer-events-auto ${
            isNavMinimized
              ? `text-sm md:text-base px-2 py-1 rounded-md ${navMinimizedLinkTone}`
              : 'text-lg md:text-2xl'
          }`}
        >
          Contact
          <span className={`${isNavMinimized ? 'hidden' : `absolute bottom-0 left-0 w-0 h-0.5 ${isInContactSection ? 'bg-white' : 'bg-foreground'} transition-all duration-300 group-hover/link:w-full`}`}></span>
        </Link>
        </div>
      </nav>

      {/* Hero Section with sticky container */}
      <div id="home" className="relative" style={{ height: '150vh' }}>
        <div className="sticky top-0 h-screen overflow-visible">
          <div className="grid lg:grid-cols-2 h-full">
            <div className="flex items-center justify-center p-6 md:p-8 lg:p-16 relative">
              <div 
                className="relative w-full max-w-lg aspect-[3/4] transition-all duration-300 ease-out hover:scale-105 group px-4 rounded-2xl overflow-hidden"
                style={{
                  transform: `scale(${imageScale}) translateX(${imageTranslateX}%)`,
                  transformOrigin: 'center center',
                }}
              >
                <Image
                  src="/profileImage.JPEG"
                  alt={profile.name}
                  fill
                  className="object-cover transition-all duration-700 group-hover:grayscale"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 md:p-8 lg:p-16 relative">
              <div 
                className="flex-1 flex flex-col justify-center transition-opacity duration-300 pt-24 md:pt-40 lg:pt-48"
                style={{ opacity: heroContentOpacity }}
              >
                <h1 
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-3 md:mb-6 cursor-pointer font-mono glitch-container group/name"
                  onMouseEnter={startHackEffect}
                  onMouseLeave={resetText}
                >
                  <span className="glitch-text" data-text={hackText}>{hackText}</span>
                </h1>
                
                <div className="space-y-1 md:space-y-2 mb-6 md:mb-12">
                  <p className="text-xl md:text-3xl font-semibold text-foreground tracking-tight">
                    {profile.headline}
                  </p>
                  <p className="text-sm md:text-lg text-muted-foreground max-w-xl">
                    {profile.summary}
                  </p>
                </div>

              </div>
              
            </div>
          </div>
        </div>
      </div>

      <section 
        id="about" 
        className="min-h-screen bg-white py-12 md:py-16 lg:py-20 px-6 md:px-12 lg:px-16"
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="transition-all duration-700"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 600) / 200)),
              transform: `translateY(${Math.max(0, 40 - (scrollY - 600) / 10)}px)`,
            }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-12 md:mb-16 lg:mb-20">
              About
            </h2>
            <div className="grid grid-cols-1 gap-8 lg:gap-12 items-start">
              <div className="space-y-6">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  {profile.summary}
                </p>
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-wider text-gray-500">Focus</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      'Embedded systems',
                      'Backend & APIs',
                      'Frontend UIs',
                      'Test automation',
                      'Linux',
                    ].map((t) => (
                      <span
                        key={t}
                        className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm md:text-base"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="min-h-screen bg-white px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="transition-all duration-700" style={revealStyle(900)}>
            <h2 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-24 text-black text-center"
            >
              Background
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-black">Education</h3>
                  <div className="space-y-6">
                    {profile.education.map((item) => (
                      <div key={`${item.school}-${item.period}`} className="space-y-2">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-lg font-semibold text-black">{item.school}</p>
                          <p className="text-sm text-gray-500">{item.period}</p>
                        </div>
                        {item.details?.length ? (
                          <ul className="text-base md:text-lg text-gray-600 leading-relaxed list-disc pl-5 space-y-1">
                            {item.details.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 border-t border-gray-200 pt-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-black">Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm md:text-base"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-black">Thesis</h3>
                  </div>
                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    <Link
                      href={profile.thesis.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-800 transition-colors"
                    >
                      {profile.thesis.title}
                    </Link>{' '}
                    ({profile.thesis.year})
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold text-black">Work experience</h3>
                <div className="space-y-8">
                  {profile.experience.map((item) => (
                    <div key={`${item.company}-${item.period}`} className="space-y-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-black">
                            {item.role}
                            <span className="text-gray-600 font-normal">{' '}— {item.company}</span>
                            {item.location ? <span className="text-gray-500">{`, ${item.location}`}</span> : null}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{item.period}</p>
                      </div>
                      <ul className="text-base md:text-lg text-gray-600 leading-relaxed list-disc pl-5 space-y-1">
                        {item.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="activity" className="min-h-screen bg-white px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="transition-all duration-700" style={revealStyle(1700)}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-24 text-black text-center">
              Activity
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-wider text-gray-500">GitHub</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-black">Latest contributions</h3>
                </div>

                {githubStatus === 'loading' ? (
                  <p className="text-base md:text-lg text-gray-600">Loading GitHub activity…</p>
                ) : githubStatus === 'error' ? (
                  <p className="text-base md:text-lg text-gray-600">
                    Couldn’t load GitHub activity right now.
                  </p>
                ) : githubHighlights.length ? (
                  <div className="space-y-4">
                    {githubHighlights.map((h) => (
                      <div key={h.id} className="p-5 bg-gray-50 rounded-2xl">
                        <p className="text-base md:text-lg text-black font-semibold">{h.title}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                          {h.repo ? <span>{h.repo}</span> : null}
                          <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                          {h.url ? (
                            <Link
                              href={h.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-gray-800"
                            >
                              Open
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base md:text-lg text-gray-600">No recent public activity found.</p>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-wider text-gray-500">Spotify</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-black">What I listen while hustling</h3>
                </div>

                {spotifyStatus === 'loading' ? (
                  <p className="text-base md:text-lg text-gray-600">Loading Spotify status…</p>
                ) : spotifyStatus === 'error' ? (
                  <p className="text-base md:text-lg text-gray-600">
                    Couldn’t load Spotify status right now.
                  </p>
                ) : spotifyNowPlaying?.configured === false ? (
                  <div className="p-5 bg-gray-50 space-y-2 rounded-2xl">
                    <p className="text-base md:text-lg text-black font-semibold">Not configured</p>
                    <p className="text-base md:text-lg text-gray-600">
                      {spotifyNowPlaying?.message}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {spotifyNowPlaying?.isPlaying && spotifyNowPlaying?.track ? (
                      <div className="p-5 bg-gray-50 flex gap-5 rounded-2xl">
                        {spotifyNowPlaying.albumImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={spotifyNowPlaying.albumImage}
                            alt="Album cover"
                            className="w-20 h-20 object-cover"
                          />
                        ) : null}
                        <div className="space-y-1">
                          <p className="text-base md:text-lg text-black font-semibold">
                            {spotifyNowPlaying.track}
                          </p>
                          {spotifyNowPlaying.artists?.length ? (
                            <p className="text-base md:text-lg text-gray-600">
                              {spotifyNowPlaying.artists.join(', ')}
                            </p>
                          ) : null}
                          {spotifyNowPlaying.url ? (
                            <Link
                              href={spotifyNowPlaying.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-gray-600 underline hover:text-gray-800"
                            >
                              Open in Spotify
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-gray-50 rounded-2xl">
                        <p className="text-base md:text-lg text-gray-600">
                          Not playing anything right now.
                        </p>
                      </div>
                    )}

                    <div className="p-5 bg-gray-50 space-y-3 rounded-2xl">
                      <p className="text-sm uppercase tracking-wider text-gray-600">Previously listened</p>
                      {spotifyRecentlyPlayed?.error ? (
                        <p className="text-sm text-gray-600">{spotifyRecentlyPlayed.error}</p>
                      ) : spotifyRecentlyPlayed?.items?.length ? (
                        <ul className="space-y-1">
                          {spotifyRecentlyPlayed.items.map((t, idx) => (
                            <li
                              key={`${t.id ?? t.track ?? 'track'}-${t.playedAt ?? idx}`}
                              className="text-sm text-gray-700"
                            >
                              {t.url ? (
                                <Link
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-gray-900"
                                >
                                  {t.track ?? 'Unknown track'}
                                </Link>
                              ) : (
                                <span>{t.track ?? 'Unknown track'}</span>
                              )}
                              {t.artists?.length ? (
                                <span className="text-gray-500">{` — ${t.artists.join(', ')}`}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">No recent plays found.</p>
                      )}
                    </div>

                    <div className="p-5 bg-gray-50 space-y-3 rounded-2xl">
                      <p className="text-sm uppercase tracking-wider text-gray-600">Top 10 songs (last 4 weeks)</p>
                      {spotifyTopTracks?.error ? (
                        <p className="text-sm text-gray-600">{spotifyTopTracks.error}</p>
                      ) : spotifyTopTracks?.items?.length ? (
                        <ul className="space-y-1">
                          {spotifyTopTracks.items.map((t, idx) => (
                            <li key={`${t.id ?? t.track ?? 'track'}-${idx}`} className="text-sm text-gray-700">
                              {t.url ? (
                                <Link
                                  href={t.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:text-gray-900"
                                >
                                  {idx + 1}. {t.track ?? 'Unknown track'}
                                </Link>
                              ) : (
                                <span>{idx + 1}. {t.track ?? 'Unknown track'}</span>
                              )}
                              {t.artists?.length ? (
                                <span className="text-gray-500">{` — ${t.artists.join(', ')}`}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">No top tracks found for the last 4 weeks.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="blog" className="min-h-screen bg-white px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="transition-all duration-700" style={revealStyle(2300)}>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-12 md:mb-16">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wider text-gray-500">Writing</p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black">
                  Blog
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-base md:text-lg font-semibold underline hover:text-gray-700 transition-colors"
              >
                View all posts
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {latestBlogPosts.map((post) => (
                <article key={post.slug} className="p-6 bg-gray-50 rounded-2xl space-y-4">
                  <p className="text-sm text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-black">{post.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={`${post.slug}-${tag}`}
                        className="px-3 py-1 rounded-full bg-white text-gray-700 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="feedback" className="min-h-screen bg-white px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="transition-all duration-700" style={revealStyle(2500)}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-16 md:mb-24 text-black text-center">
              Feedback from work
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {profile.feedbackQuotes.map((q, idx) => (
                <div
                  key={`${q.quote}-${idx}`}
                  className="p-8 bg-gray-50 space-y-5 text-center flex flex-col items-center justify-center rounded-2xl"
                >
                  <p className="text-lg md:text-xl text-black leading-relaxed max-w-prose mx-auto">
                    “{q.quote}”
                  </p>
                  {(q.author || q.context) ? (
                    <div className="space-y-1">
                      {q.author ? (
                        <p className="text-base md:text-lg font-semibold text-black">{q.author}</p>
                      ) : null}
                      {q.context ? (
                        <p className="text-sm md:text-base text-gray-600">{q.context}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="min-h-screen bg-black text-white px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 md:mb-12"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 3200) / 400)),
              transform: `translateY(${Math.max(0, 40 - (scrollY - 3200) / 12)}px)`
            }}
          >
            Get in touch
          </h2>

          <p 
            className="text-lg md:text-xl text-gray-400 mb-12 md:mb-16 max-w-2xl"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 3300) / 300)),
              transform: `translateY(${Math.max(0, 30 - (scrollY - 3300) / 10)}px)`
            }}
          >
            Have a project in mind? Let's collaborate!
          </p>

          <form 
            onSubmit={handleSubmit}
            className="space-y-8"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 3400) / 300)),
              transform: `translateY(${Math.max(0, 40 - (scrollY - 3400) / 10)}px)`
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 group">
                <label htmlFor="name" className="block text-sm uppercase tracking-wider text-gray-400 group-focus-within:text-white transition-colors">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b-2 border-gray-700 focus:border-white py-3 text-lg md:text-xl outline-none transition-all duration-300"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-3 group">
                <label htmlFor="email" className="block text-sm uppercase tracking-wider text-gray-400 group-focus-within:text-white transition-colors">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b-2 border-gray-700 focus:border-white py-3 text-lg md:text-xl outline-none transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-3 group">
              <label htmlFor="message" className="block text-sm uppercase tracking-wider text-gray-400 group-focus-within:text-white transition-colors">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full bg-transparent border-b-2 border-gray-700 focus:border-white py-3 text-lg md:text-xl outline-none resize-none transition-all duration-300"
                placeholder="Tell me about your project..."
              />
            </div>

            <div className="pt-8">
              <button
                type="submit"
                className="group relative inline-flex items-center gap-4 text-xl md:text-2xl font-bold bg-white text-black px-10 py-5 rounded-xl hover:bg-gray-200 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 group-hover:text-black transition-colors duration-300">Send Message</span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="relative z-10 transition-transform duration-300 group-hover:translate-x-2 group-hover:stroke-black"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </button>
            </div>
          </form>

          <div 
            className="mt-16 md:mt-20 pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 3600) / 300)),
            }}
          >
            <div className="space-y-2">
              <p className="text-gray-400 text-sm uppercase tracking-wider">Direct Contact</p>
              <Link 
                href={`mailto:${profile.email}`}
                className="text-xl md:text-2xl hover:text-gray-400 transition-colors"
              >
                {profile.email}
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm uppercase tracking-wider">Socials</p>
              <div className="flex flex-wrap items-center gap-4 text-xl">
                <Link
                  href={`https://github.com/${profile.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors"
                >
                  GitHub
                </Link>
                {profile.linkedinUrl ? (
                  <Link
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400 transition-colors"
                  >
                    LinkedIn
                  </Link>
                ) : null}
                {profile.youtubeUrl ? (
                  <Link
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-400 transition-colors"
                  >
                    YouTube
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
