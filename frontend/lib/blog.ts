export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'building-full-stack-freelance-project',
    title: 'Building a Full-Stack Freelance Project End-to-End',
    excerpt:
      'How I shipped a production-ready web app using Next.js, NestJS, Docker, and practical testing during a freelance client project.',
    publishedAt: '2026-04-10',
    tags: ['Next.js', 'NestJS', 'Docker'],
  },
  {
    slug: 'from-embedded-to-web-development',
    title: 'From Embedded Systems to Web Development',
    excerpt:
      'Lessons learned while moving between hardware-oriented development and modern frontend/backend web stacks.',
    publishedAt: '2026-03-05',
    tags: ['Embedded', 'Backend', 'Frontend'],
  },
  {
    slug: 'ai-assisted-development-workflow',
    title: 'My AI-Assisted Development Workflow',
    excerpt:
      'A practical workflow for using AI tools to speed up implementation, improve code quality, and keep iteration cycles short.',
    publishedAt: '2026-02-12',
    tags: ['AI', 'Workflow', 'Developer Productivity'],
  },
]
