export type ProfileEducation = {
  school: string
  location?: string
  period: string
  details?: string[]
}

export type ProfileExperience = {
  company: string
  location?: string
  role: string
  period: string
  highlights: string[]
}

export type ProfileThesis = {
  title: string
  year: string
  url: string
}

export type ProfileFeedbackQuote = {
  quote: string
  author?: string
  context?: string
}

export type ProfileAboutImage = {
  src: string
  alt: string
  caption: string
}

export type Profile = {
  name: string
  headline: string
  summary: string
  about: string[]
  focusAreas: string[]
  aboutGallery: ProfileAboutImage[]
  email: string
  githubUsername: string
  linkedinUrl?: string
  youtubeUrl?: string
  feedbackQuotes: ProfileFeedbackQuote[]
  skills: string[]
  education: ProfileEducation[]
  experience: ProfileExperience[]
  thesis: ProfileThesis
}

export const profile: Profile = {
  name: 'Joona Kaikkonen',
  headline: 'Bachelor of Engineer in Information Technology',
  summary:
    'Bachelor of Engineer in Information Technology with strong knowledge and interest in embedded systems and software development. Skilled in both hardware-level and software-level problem solving, with practical knowledge of tools and languages for both Frontend and Backend. Skilled in using AI-assisted development tools to improve coding efficiency and code quality.',
  about: [
    "Hi, I am a 24 years old, Bachelor of Engineer in Information Technology, graduated in autumn 2025 from Oulu University of Applied Sciences. I have good technical skills and enjoy solving problems and learning new technologies. I am currently looking for a job in the field of ICT.",
    " When I'm not working on a project, you'll almost certainly find me outside doing some kind of sport. My main focus is on endurance sports, as I love the mental and physical challenge of going the distance. Last summer, I participated in a 100km trail run competition. I'm keeping that momentum going this summer as I prepare for an upcoming 66km trail race. My dream is to channel all this training into completing a full Ironman sometime in the future.",
  ],
  focusAreas: [
    'Embedded systems',
    'Backend & APIs',
    'Full Stack Development',
    'Test automation',
    'Linux',
  ],
  aboutGallery: [
    {
      src: '/IMG_1789.JPEG',
      alt: 'First-person view of cross-country skiing on a groomed snowy trail',
      caption: 'Last winter I picked up cross-country skiing as a new hobby.',
    },
    {
      src: '/IMG_0227.JPEG',
      alt: 'Alpine mountain landscape with a lake and small waterfall',
      caption: 'Image from my trip to the Bavarian Alps during my exchange year.',
    },
    {
      src: '/IMG_0795.JPEG',
      alt: 'Road cyclist in full kit with bike, mirror selfie in an elevator',
      caption: 'Cycling is a great way to stay fit and enjoy the outdoors.',
    },
  ],

  email: 'joona.kaik@outlook.com',
  githubUsername: 'jones753',
  linkedinUrl: 'https://www.linkedin.com/in/joona-kaikkonen-8348b6250/',
  feedbackQuotes: [
    {
      quote:
        'Suosittelemme lämpimästi Joona Kaikkosta työtehtäviin ohjelmistokehityksen parissa. Yhteistyömme aikana hän osoittautui erittäin luotettavaksi ja joustavaksi ammattilaiseksi, jonka kanssa työskentely sujui mutkattomasti. Kaikki sovitut asiat toteutuivat ajallaan ja sovitulla tavalla, ja Joona piti aktiivisesti huolta työn laadusta sekä projektin etenemisestä. Teknisesti Joona hyödynsi laajasti full stack -osaamistaan sekä koneoppimisen (ML) menetelmiä palvelumme kehittämisessä. Hänen panoksensa oli merkittävä erityisesti ratkaisujen toteutuksessa ja kehitystyön sujuvuudessa.',
      context: 'Velocitra Oy — velocitra.com',
    },
    {
      quote:
        'Joona has performed the duties with excellent working skills and excellent behaviour',
      context: 'Nokia Solutions and Networks Oy',
    },
  ],
  skills: [
    'Python',
    'C++',
    'JavaScript',
    'Embedded systems',
    'Full Stack Development',
    'API development',
    'Linux',
    'Robot Framework',
    'Git',
    'Machine learning',
    'AI-assisted development',
    'Next.js',
    'NestJS',
    'Docker',
  ],
  education: [
    {
      school: 'Oulu University of Applied Sciences',
      period: '2021–2025',
      details: ['Bachelor of Engineer in Information Technology.'],
    },
    {
      school: 'Ulm University of Applied Sciences',
      period: '2023–2024',
      details: ['Exchange year studying Information Management Automotive.'],
    },
    {
      school: 'Upper Secondary School Ii',
      period: '2017–2020',
      details: ['Graduated in 2020.'],
    },
  ],
  experience: [
    {
      company: 'Velocitra',
      location: 'Remote (Freelance)',
      role: 'Full-Stack Developer',
      period: '2/2026–4/2026',
      highlights: [
        'Developed a full-stack web application.',
        'Used Next.js (frontend), NestJS (backend), and Docker for a containerized development setup.',
        'Worked mainly with JavaScript and React.',
        'Helped tune and build a custom ML model.',
        'Wrote end-to-end tests for endpoints.',
      ],
    },
    {
      company: 'Nokia',
      location: 'Oulu',
      role: 'Software Engineer Trainee',
      period: '6/2025–11/2025',
      highlights: [
        'Developed APIs, authentication services, and various Python projects.',
        'Built web UIs for applications.',
        'Completed thesis work focused on a test automation tool for SNMP-controlled power supply units (PSUs).',
        'Collaborated internationally with diverse teams, strengthening communication and teamwork.',
      ],
    },
    {
      company: 'Symbio',
      location: 'Oulu',
      role: 'Information Technology Trainee',
      period: '2/2025–5/2025',
      highlights: [
        'Assembled a demo system for a digital key system intended for use in a car.',
        "Designed a Qt frontend interface for the car’s central console display to demonstrate the system.",
        'Gained experience in C++ programming, Linux, and hardware-oriented software development.',
      ],
    },
    {
      company: 'Kärkkäinen',
      location: 'Ii',
      role: 'Retail Worker',
      period: '10/2020–6/2022',
      highlights: ['Worked as a store employee for about one year.'],
    },
  ],
  thesis: {
    title: 'Automated Testing and Monitoring System for Power Product Quality Assurance',
    year: '2025',
    url: 'https://www.theseus.fi/handle/10024/897281',
  },
}

