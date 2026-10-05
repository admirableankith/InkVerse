const initialCategories = [
  {
    name: 'College Life',
    slug: 'college-life',
    description: 'Insights, challenges, and lessons learned from navigating university life.',
    type: 'both'
  },
  {
    name: 'Reflections',
    slug: 'reflections',
    description: 'Deep dives into thoughts, journaling, and mindful perspectives.',
    type: 'blog'
  },
  {
    name: 'Travel & Journeys',
    slug: 'travel-journeys',
    description: 'Personal stories, wanderlust, and serendipitous adventures.',
    type: 'story'
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    description: 'Practical habits, routines, and systems for student life.',
    type: 'blog'
  },
  {
    name: 'Books & Ideas',
    slug: 'books-ideas',
    description: 'Takeaways from books and big concepts that reshape how we think.',
    type: 'blog'
  },
  {
    name: 'Personal Experiences',
    slug: 'personal-experiences',
    description: 'Real, vulnerable stories about growth, friendships, and change.',
    type: 'story'
  }
];

const initialPosts = [
  {
    title: 'Lessons I Learned During College: Beyond Textbooks and Grades',
    slug: 'lessons-i-learned-during-college',
    excerpt: 'When I first walked onto campus three years ago, I thought success was simply a matter of high GPAs. Here is what actually shaped who I am becoming.',
    category: 'College Life',
    type: 'blog',
    tags: ['College', 'Growth', 'Mindset', 'Life Lessons'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: true,
    readingTime: '5 min read',
    publishedAt: new Date('2026-09-15T10:00:00Z'),
    views: 342,
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>The Illusion of the Perfect Plan</h2>
<p>When you step into university as a freshman, everyone tells you to plan everything out: your four-year course map, internships, career trajectory, and five-year milestones. But if college has taught me anything so far, it is that the best experiences often happen in the unplanned margins.</p>

<p>I remember sitting in the library during my second semester, agonizing over an assignment that felt like the defining moment of my academic career. Today, I can barely remember what that assignment was about. What I do remember vividly is the two-hour conversation that followed in the cafeteria with friends who came from across the world, debating philosophy, music, and our anxieties about the future.</p>

<blockquote>"Education is not merely the transmission of information; it is the slow, deliberate cultivation of how you pay attention to the world."</blockquote>

<h2>1. Curiosity Beats Compliance Every Single Time</h2>
<p>In school, you are rewarded for memorizing what is on the rubric. In university, the real breakthrough happens when you step outside the syllabus. The professors who left the deepest mark on me weren't the ones whose exams I aced, but the ones whose office hours turned into discussions about books they loved.</p>

<ul>
  <li><strong>Read widely:</strong> Don't restrict yourself solely to your major's prescribed texts. Some of the most valuable clarity comes from interdisciplinary reading.</li>
  <li><strong>Ask better questions:</strong> When you stop asking <em>"Will this be on the test?"</em> and start asking <em>"Why does this principle work this way?"</em>, learning stops feeling like a chore.</li>
  <li><strong>Build personal projects:</strong> Writing essays and building small tools for fun teaches you ownership that structured coursework rarely provides.</li>
</ul>

<h2>2. The Compounding Power of Small Routines</h2>
<p>Early on, I struggled with the sudden abundance of unstructured time. Free afternoons felt endless, yet exam weeks always arrived with panic. It took a while to realize that sustainable energy comes from quiet, non-negotiable daily rhythms.</p>

<p>Waking up an hour before classes start, going for a brisk walk around the quad, and spending twenty minutes with a notebook gave me an emotional anchor that survived even the most intense semester crunches.</p>

<h2>3. Community Is Built on Consistency, Not Convenience</h2>
<p>Good friendships don't just happen because you live in the same dormitory; they flourish when you show up repeatedly. The shared late-night study sessions, the collaborative tea breaks, and the quiet solidarity of working side by side created friendships that anchor me today.</p>

<h2>Looking Ahead</h2>
<p>As I continue through my college journey, I hold onto this truth: grades matter for opening initial doors, but your character, curiosity, and kindness determine the kind of human you become in the rooms you enter.</p>
    `
  },
  {
    title: 'Why I Started Writing: Finding Clarity in a Fast-Paced World',
    slug: 'why-i-started-writing',
    excerpt: 'Writing was never about having an audience; it began as an honest attempt to untangle my own thoughts and slow down the daily rush.',
    category: 'Reflections',
    type: 'blog',
    tags: ['Writing', 'Self-Reflection', 'Habits', 'Creativity'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: true,
    readingTime: '4 min read',
    publishedAt: new Date('2026-09-22T14:30:00Z'),
    views: 289,
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>The Noise of the Modern Feed</h2>
<p>We live in an age where information pours over us like a waterfall. Every morning starts with notifications, algorithmic feeds, headlines, and hot takes. For a long time, I felt like a passive consumer of other people's conclusions.</p>

<p>I noticed that I could read twenty articles in a single day and yet, by dinner time, not be able to articulate a single coherent thought of my own. My mind felt crowded yet surprisingly shallow.</p>

<h2>The Pen as an Anchor</h2>
<p>Starting this blog wasn't an ambition to establish authority or lecture anyone. It was a humble commitment to think for myself. Writing forces you to slow down. You cannot skim a sentence that you are currently trying to compose.</p>

<blockquote>"Writing is the process by which you realize that you do not understand what you thought you understood."</blockquote>

<h2>What Writing Has Given Me</h2>
<ol>
  <li><strong>Clarity of Thought:</strong> Putting fuzzy emotions and fragmented ideas into full sentences reveals where the gaps in logic lie.</li>
  <li><strong>An Honest Archive:</strong> Having an essay written six months ago allows me to observe how my worldview is maturing over time.</li>
  <li><strong>Meaningful Connections:</strong> When you share an authentic reflection, you often discover that quiet strangers halfway across the world were feeling the exact same thing.</li>
</ol>

<h2>An Invitation to Create</h2>
<p>If you've been hesitating to write down your experiences, start small. You don't need a grand manifesto. A single honest paragraph about an observation on your walk home is enough.</p>
    `
  },
  {
    title: 'A Small Journey That Changed My Perspective',
    slug: 'a-small-journey-that-changed-my-perspective',
    excerpt: 'A spontaneous solo weekend train ride to a quiet mountain town taught me more about silence, patience, and noticing details than months in a crowded lecture hall.',
    category: 'Travel & Journeys',
    type: 'story',
    tags: ['Travel', 'Memories', 'Mindfulness', 'Solitude'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: true,
    readingTime: '6 min read',
    publishedAt: new Date('2026-09-28T09:15:00Z'),
    views: 415,
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>The Morning Train</h2>
<p>The dawn air had that crisp, blue chill that only early autumn brings. With a small backpack carrying just a change of clothes, a beat-up paperback, and my journal, I boarded the 6:15 AM suburban passenger train heading north toward the foothills.</p>

<p>For the first hour, the train clattered through suburban stations, passengers boarding with sleepy eyes and thermos mugs. But as the concrete gave way to pine forests and mist-covered meadows, something inside my chest loosened.</p>

<h2>The Tea Stall by the Bend</h2>
<p>I got off at an unhurried station whose name wasn't on any top travel list. A short walk along a stone pathway led to a wooden tea stall overlooking a shallow, rushing stream.</p>

<p>The owner, an elderly man in a woolen sweater, handed me a clay cup of steaming cardamom tea without saying much. We sat on a wooden bench listening to the water tumble over smooth river pebbles.</p>

<blockquote>"Sometimes the greatest destination is simply a place where no one expects anything from you."</blockquote>

<h2>Learning to Look Closely</h2>
<p>In our regular student routine, we are always rushing: walking to class while checking email, eating lunch while reviewing slides, talking while glancing at our watches. Here, there was nowhere to rush.</p>

<p>I spent three hours on that bench, watching the sunlight pierce through the pine needles, observing the way leaves drifted down into the river eddy, and writing without any deadline or purpose other than bearing witness.</p>

<h2>Coming Back Home</h2>
<p>When I returned to my dorm room on Sunday night, the room was the exact same size as before. But I felt different. The quiet hills had reminded me that peace is not something you buy at a ticket counter; it is a quality of attention you can cultivate anywhere if you choose to pause.</p>
    `
  },
  {
    title: 'Things I Wish I Knew in My First Year',
    slug: 'things-i-wish-i-knew-in-my-first-year',
    excerpt: 'From managing imposter syndrome to realizing everyone is just figuring it out as they go — here are heartfelt reminders for new students.',
    category: 'College Life',
    type: 'blog',
    tags: ['College Life', 'Freshman Advice', 'Student Growth'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: false,
    readingTime: '4 min read',
    publishedAt: new Date('2026-09-30T11:00:00Z'),
    views: 198,
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>1. Everyone Feels Like an Imposter at First</h2>
<p>During the opening week orientation, I looked around the auditorium convinced that everyone else had their life mapped out with ironclad confidence. Years later, having spoken intimately with dozens of classmates, I know the truth: virtually everyone was quietly battling self-doubt.</p>

<h2>2. Sleep Is Not a Currency to Trade Away</h2>
<p>There is a weird badge of honor among college students about pulling all-nighters. But sacrificing sleep systematically degrades your memory, your mood, and your ability to appreciate what you are learning. Protecting seven hours of rest is a superpower.</p>

<h2>3. It Is Okay to Change Your Direction</h2>
<p>You do not need to lock your entire 40-year career into stone at age nineteen. Take courses outside your comfort zone. Join clubs that have nothing to do with your resume. Some of your greatest passions will be discovered entirely by accident.</p>
    `
  },
  {
    title: 'Finding Time to Write as a Busy Student',
    slug: 'finding-time-to-write-as-a-student',
    excerpt: 'How to maintain a consistent creative practice alongside lectures, lab reports, assignments, and exams without burning out.',
    category: 'Productivity',
    type: 'blog',
    tags: ['Productivity', 'Writing Routine', 'Time Management'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: false,
    readingTime: '5 min read',
    publishedAt: new Date('2026-10-01T16:20:00Z'),
    views: 210,
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>The Myth of the 4-Hour Writing Block</h2>
<p>For a long time, I told myself that I couldn't write because I didn't have uninterrupted four-hour stretches of serenity. Waiting for the 'perfect afternoon' meant weeks passed without a single written word.</p>

<h2>The 20-Minute Micro-Sprint</h2>
<p>What changed everything was lowering the bar. Instead of demanding a finished 2,000-word essay, I committed to sitting down with my laptop for just twenty minutes before breakfast. If I wrote two paragraphs, that was a win.</p>

<ul>
  <li><strong>Keep an idea scratchpad:</strong> Jot down titles and bullet thoughts throughout your day on your phone so you never start with a blank page.</li>
  <li><strong>Separate writing from editing:</strong> Never edit while drafting. Let the rough first draft spill out, then polish it the next day with fresh eyes.</li>
  <li><strong>Treat writing as a decompression ritual:</strong> When writing feels like self-care rather than another homework assignment, you look forward to it.</li>
</ul>
    `
  },
  {
    title: 'The Joy of Slow Reading: Why I Love Physical Books',
    slug: 'the-joy-of-slow-reading',
    excerpt: 'In an era of hyper-summarized book recaps and skim reading, there is profound joy in holding a physical book and lingering on every sentence.',
    category: 'Books & Ideas',
    type: 'blog',
    tags: ['Books', 'Reading', 'Philosophy', 'Focus'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: false,
    readingTime: '4 min read',
    publishedAt: new Date('2026-10-02T13:45:00Z'),
    views: 174,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>The Scent of Paper and Time</h2>
<p>There is a tactile intimacy in a paperback book: the weight in your hands, the rough texture of the paper, the pencil notes penciled into the margins over months of reading. In contrast to glowing screens that continuously tease notifications, a physical book asks for nothing except your undivided presence.</p>

<p>When you read slowly, you allow an author who lived decades or centuries ago to speak directly into your consciousness. It is the closest thing humanity has ever invented to time travel.</p>
    `
  },
  {
    title: 'Dorm Room Reflections: On Learning to Cook My Own Meals',
    slug: 'dorm-room-reflections-cooking',
    excerpt: 'A humorous yet honest story of burnt toasts, shared pots, and the surprisingly comforting ritual of preparing simple food with roommates.',
    category: 'Personal Experiences',
    type: 'story',
    tags: ['Stories', 'Dorm Life', 'Food', 'Independence'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'published',
    isFeatured: false,
    readingTime: '5 min read',
    publishedAt: new Date('2026-10-03T08:00:00Z'),
    views: 160,
    coverImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>The First Culinary Disaster</h2>
<p>My first attempt at cooking on a single induction plate in our dorm hallway resulted in an alarm-triggering cloud of smoke and pasta that somehow managed to be simultaneously burnt at the bottom and raw on top.</p>

<p>My roommate walked in, took one look at the pan, burst into laughter, and pulled out two spoons. We ended up ordering takeout that night, but the shared laughter laid the foundation for dozens of Sunday dinners that followed.</p>

<h2>The Ritual of the Evening Stove</h2>
<p>Now, chopping onions and simmering lentils after a heavy day of academic lectures has become one of my favorite grounding rituals. It requires sensory attention — sight, smell, timing — pulling me completely away from digital screens.</p>
    `
  },
  {
    title: 'A Draft On Campus Architecture and Silent Corners',
    slug: 'campus-architecture-draft',
    excerpt: 'Exploring the quietest corners of our campus and how physical spaces shape how we contemplate and create.',
    category: 'Reflections',
    type: 'blog',
    tags: ['Architecture', 'Campus', 'Reflections'],
    authorName: 'Ankur',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    status: 'draft',
    isFeatured: false,
    readingTime: '3 min read',
    publishedAt: new Date('2026-10-03T12:00:00Z'),
    views: 0,
    coverImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    content: `
<h2>Under the High Archways</h2>
<p>This draft explores the historic stone arches of the north library wing and why students naturally whisper when entering high-ceilinged spaces...</p>
    `
  }
];

const initialUser = {
  name: 'Ankur',
  email: '',
  bio: "Hi, I'm Ankur! A university student, avid reader, and aspiring writer. Here I share essays, personal stories, student reflections, and honest takeaways from life on and off campus.",
  fullBio: `<p>When I started college, I felt overwhelmed by how quickly days seemed to evaporate between assignment deadlines, lecture halls, and social commitments. I realized that unless I deliberately paused to capture my thoughts, whole semesters would pass without me truly processing what I was learning.</p><p>This website is my personal notebook in public. It isn't intended to be a corporate portfolio or a hyper-optimized publishing empire. It's simply a calm, quiet haven where I can share essays about books, small travel journeys, campus stories, and reflections on navigating early adulthood.</p><blockquote>"We do not write in order to be understood; we write in order to understand what we are actually experiencing."</blockquote>`,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  education: 'Third-Year Undergraduate Student',
  interests: ['Student Growth', 'Mindfulness', 'Book Insights', 'Travel Notes', 'Dorm Reflections', 'Habit Systems'],
  writingInterests: ['Personal Essays', 'Student Experiences', 'Mindfulness & Habits', 'Book Thoughts'],
  favoriteBooks: [
    { title: 'The Anthropocene Reviewed', author: 'John Green', note: 'A beautiful masterclass in noticing small wonders in everyday life.' },
    { title: 'Atomic Habits', author: 'James Clear', note: 'Changed how I design my morning routine during heavy semester exam weeks.' },
    { title: 'Bird by Bird', author: 'Anne Lamott', note: 'Honest, funny, and deeply reassuring advice on writing and living.' },
    { title: 'Letters to a Young Poet', author: 'Rainer Maria Rilke', note: 'A timeless reminder to love the questions themselves.' }
  ],
  socialLinks: {
    twitter: 'https://twitter.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    emailContact: '',
    website: ''
  }
};

module.exports = {
  initialCategories,
  initialPosts,
  initialUser
};

