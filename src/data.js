// Edit this file to change what shows on the site.
// Projects come from your CV and your pinned GitHub repos.
// To add one, copy an entry, change the fields, and save.

export const profile = {
  name: 'John James Dayap',
  role: 'Junior Developer',
  location: 'Zambales, Philippines',
  email: 'johnjamesdyp@gmail.com',
  github: 'https://github.com/Vaujx',
  school: 'President Ramon Magsaysay State University',
  schoolYears: '2022 to 2026',
}

export const projects = [
  {
    id: 'baac',
    title: 'BAAC',
    name: 'Barangay Amungan Assistant Chatbot',
    kind: 'Capstone project',
    flavor: 'Cookies and cream',
    swatch: '#efe6d8',
    quiet:
      'A Flask web app that gives barangay residents an AI assistant. It runs on the Gemini API and answers questions about barangay services. It also helps staff schedule document requests.',
    loud: 'Paperwork, but fast. A chatbot answers the boring questions so nobody has to.',
    tags: ['Flask', 'Gemini API', 'Scheduling'],
    link: 'https://github.com/Vaujx/BAAC',
  },
  {
    id: 'gifforge',
    title: 'GIF Forge',
    name: 'GIF Forge',
    kind: 'Desktop app',
    flavor: 'Coffee',
    swatch: '#6f4a35',
    quiet:
      'A local MP4-to-GIF converter. Nothing is uploaded. Pick a clip, trim it, choose the size and frame rate. ffmpeg runs a two-pass palette pipeline for cleaner colors. It ships as a single Windows exe.',
    loud: 'Turns your clips into GIFs without sending them anywhere. Brutalist UI. Zero drama.',
    tags: ['Python', 'pywebview', 'ffmpeg', 'anime.js'],
    link: 'https://github.com/Vaujx/gif-forge',
  },
  {
    id: 'deskman',
    title: 'DESKMAN',
    name: 'DESKMAN',
    kind: 'Browser tool',
    flavor: 'Double espresso',
    swatch: '#2a1710',
    quiet:
      'A browser tool that scans one folder and helps you sort files into category folders like Pictures, Videos and Documents. It renames files in batch and previews every change before anything happens on disk.',
    loud: 'Your messy folder, finally sorted. It shows you the plan before it touches anything. Responsible chaos.',
    tags: ['JavaScript', 'HTML', 'CSS', 'Batch rename'],
    link: 'https://github.com/Vaujx/DESKMAN',
  },
  {
    id: 'quiz',
    title: 'Quiz Generator',
    name: 'AI-Powered Quiz Generator',
    kind: 'Personal project',
    flavor: 'Dark chocolate',
    swatch: '#3b2218',
    quiet:
      'Upload a PDF or DOCX. The app reads it and uses AI to build a quiz from what is inside.',
    loud: 'Turns your boring reviewer into a boss fight. Upload the file. Survive the quiz.',
    tags: ['AI', 'PDF', 'DOCX'],
    link: 'https://github.com/Vaujx/quizlet',
  },
  {
    id: 'translator',
    title: 'Batch File Translator',
    name: 'ForeignLanguage',
    kind: 'Personal Python project',
    flavor: 'Tea',
    swatch: '#c9a26b',
    quiet:
      'A lightweight Python app that translates video file names into English and renames the files. It scans a folder you choose and uses Selenium with Google Translate.',
    loud: 'Your video files, now speaking English. Show-offs.',
    tags: ['Python', 'Selenium', 'Google Translate'],
    link: 'https://github.com/Vaujx/ForeignLanguage',
  },
]

export const experience = {
  role: 'IT Support Intern',
  place: 'Botolan Municipal Police Station',
  when: 'February to May 2026',
  where: 'Botolan, Zambales',
  points: [
    'Completed a 300-hour On-the-Job Training practicum.',
    'Maintained and optimized office hardware and network connectivity.',
    'Helped reduce system downtime for station staff during daily operations.',
  ],
}

export const skills = [
  { group: 'Languages', items: ['JavaScript', 'Python', 'HTML5', 'CSS3'] },
  { group: 'Data and tools', items: ['PostgreSQL', 'pgAdmin', 'Git', 'GitHub'] },
  { group: 'Systems', items: ['Windows', 'macOS', 'Linux', 'Microsoft Office'] },
  {
    group: 'Used in my projects',
    items: ['Flask', 'Gemini API', 'Selenium', 'pywebview', 'ffmpeg', 'anime.js'],
  },
]

// Text for the phone's "About me" screen.
export const phoneAbout = {
  quiet: 'IT graduate. Thinks a lot. Builds with care. Looking for remote work.',
  loud: 'Quiet outside. LOUD with my people. Looking for remote work. Bring cookies and cream.',
  likes: 'Likes: cookies and cream, dark chocolate, coffee, tea.',
}
