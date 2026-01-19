export interface Routine {
    id: string;
    name: string;
    title: string;
    category: string;
    dailyStructure: string[];
    screenTimeDiscipline: string;
    mindsetRule: string;
    habits: string[];
    quote?: string;
    quoteAuthor?: string;
}

export interface RoutineCategory {
    id: string;
    title: string;
    description: string;
    routines: Routine[];
}

export const ROUTINE_CATEGORIES: RoutineCategory[] = [
    {
        id: 'ceos',
        title: 'CEOs & Business Leaders',
        description: 'Deep work, intentional screen usage',
        routines: [
            {
                id: 'zuckerberg',
                name: 'Mark Zuckerberg',
                title: 'Mark Zuckerberg – Focus & Long-Term Thinking',
                category: 'CEOs & Business Leaders',
                dailyStructure: [
                    'Starts day with physical fitness to reset energy.',
                    'Dedicates morning hours to creative, high-leverage work.',
                    'Wear same style of clothes to reduce decision fatigue.',
                    'Ends day by spending time with family, disconnected from work.'
                ],
                screenTimeDiscipline: 'Known for intentional technology use, focusing on building rather than consuming, and setting clear boundaries for family time.',
                mindsetRule: 'Energy flows where attention goes.',
                habits: [
                    'Fixed distraction-free deep work blocks',
                    'Physical exercise before screen time',
                    'Eliminating small trivial decisions'
                ],
                quote: 'The biggest risk is not taking any risk.',
                quoteAuthor: 'Mark Zuckerberg'
            },
            {
                id: 'bezos',
                name: 'Jeff Bezos',
                title: 'Jeff Bezos – Attention Discipline & Patience',
                category: 'CEOs & Business Leaders',
                dailyStructure: [
                    'Prioritizes 8 hours of sleep for high-quality decisions.',
                    'Schedule "puttering" time in the morning (coffee, newspaper) before screens.',
                    'Holds high-IQ meetings strictly before lunch.',
                    'Makes fewer, but higher quality decisions per day.'
                ],
                screenTimeDiscipline: 'Avoids early morning phone use to allow mind to wander and think freely before information intake.',
                mindsetRule: 'Stress comes from ignoring things you shouldn\'t ignore.',
                habits: [
                    'No phone first thing in the morning',
                    'Prioritize sleep over extra work hours',
                    'Focus on one thing at a time'
                ],
                quote: 'If you double the number of experiments you do per year you’re going to double your inventiveness.',
                quoteAuthor: 'Jeff Bezos'
            },
            {
                id: 'musk',
                name: 'Elon Musk',
                title: 'Elon Musk – Deep Work & Reduced Distraction',
                category: 'CEOs & Business Leaders',
                dailyStructure: [
                    'Works in 5-minute time slots to maximize intensity.',
                    'Focuses entirely on engineering and product, avoiding admin fluff.',
                    'Often disconnects from standard communication to focus on critical path items.',
                    'Uses manufacturing floor walks to ground reality.'
                ],
                screenTimeDiscipline: 'Uses technology as a tool for output and coordination, not for passive consumption or distraction.',
                mindsetRule: 'Constantly think about how you could be doing things better.',
                habits: [
                    'Batch processing emails and messages',
                    'Hyper-focus on the specific problem at hand',
                    'Avoid meaningless meetings'
                ],
                quote: 'Persistence is very important. You should not give up unless you are forced to give up.',
                quoteAuthor: 'Elon Musk'
            },
            {
                id: 'nadella',
                name: 'Satya Nadella',
                title: 'Satya Nadella – Calm Leadership & Digital Balance',
                category: 'CEOs & Business Leaders',
                dailyStructure: [
                    'Starts with running for mental clarity.',
                    'Validates learning through reading and listening.',
                    'Focuses on empathy and understanding team dynamics.',
                    'Balances intensive meetings with reflection time.'
                ],
                screenTimeDiscipline: 'Advocates for digital wellbeing and disconnects to ensure presence with family and clarity of thought.',
                mindsetRule: 'Empathy makes you a better innovator.',
                habits: [
                    'Daily movement for mental reset',
                    'Continuous learning over passive scrolling',
                    'Active listening without device distraction'
                ]
            }
        ]
    },
    {
        id: 'cricket',
        title: 'Cricket Legends',
        description: 'Consistency, practice, distraction control',
        routines: [
            {
                id: 'sachin',
                name: 'Sachin Tendulkar',
                title: 'Sachin Tendulkar – Long-Term Consistency & Focus',
                category: 'Cricket Legends',
                dailyStructure: [
                    'Early morning practice sessions initiated before sunrise.',
                    'Visualizes match situations before stepping onto the field.',
                    'Strict rest and recovery protocols post-training.',
                    'Maintains a quiet, private life to stay grounded.'
                ],
                screenTimeDiscipline: 'Known for long, uninterrupted practice sessions with minimal distractions and avoiding external noise.',
                mindsetRule: 'Mastery comes from attention repeated daily.',
                habits: [
                    'Fixed distraction-free practice time',
                    'Focus on process, not just results',
                    'Consistent sleep schedule for recovery'
                ],
                quote: 'Chase your dreams but make sure you don\'t find shortcuts.',
                quoteAuthor: 'Sachin Tendulkar'
            },
            {
                id: 'kohli',
                name: 'Virat Kohli',
                title: 'Virat Kohli – Discipline & Focus',
                category: 'Cricket Legends',
                dailyStructure: [
                    'Strict diet and fitness regime followed religiously.',
                    'Intense training blocks with zero external interference.',
                    'Reads to calm the mind and improve focus.',
                    'Prioritizes recovery to maintain high energy levels.'
                ],
                screenTimeDiscipline: 'Uses discipline to block out social media noise and criticism, focusing entirely on performance and growth.',
                mindsetRule: 'Self-belief and hard work will always earn you success.',
                habits: [
                    'Strict diet and gym routine',
                    'Reading instead of scrolling',
                    'Blocking out negative noise'
                ],
                quote: 'I like to be myself, and I don\'t pretend.',
                quoteAuthor: 'Virat Kohli'
            },
            {
                id: 'dhoni',
                name: 'MS Dhoni',
                title: 'MS Dhoni – Calm Under Pressure & Low Distraction',
                category: 'Cricket Legends',
                dailyStructure: [
                    'Keeps life simple and detached from glamour.',
                    'Focuses on the present moment during matches.',
                    'Engages in hobbies like biking and army training to disconnect.',
                    'Maintains distance from phone to stay in the "now".'
                ],
                screenTimeDiscipline: 'Famous for not carrying a phone often, ensuring he remains present and unaffected by digital chaos.',
                mindsetRule: 'Process is more important than the result.',
                habits: [
                    'Disconnecting from phone completely',
                    'Focusing on the present moment',
                    'Simple living outside of work'
                ],
                quote: 'I admit I make mistakes. I am human.',
                quoteAuthor: 'MS Dhoni'
            }
        ]
    },
    {
        id: 'sports_global',
        title: 'Sports Icons (Global)',
        description: 'Mental strength & routine discipline',
        routines: [
            {
                id: 'serena',
                name: 'Serena Williams',
                title: 'Serena Williams – Training Focus',
                category: 'Sports Icons (Global)',
                dailyStructure: [
                    'Early morning training to start day with a win.',
                    ' compartmentalizes life: Tennis time is JUST tennis.',
                    'Prioritizes family time without work distractions.',
                    'Uses mental affirmation to build confidence.'
                ],
                screenTimeDiscipline: 'Focuses intensely during training blocks, leaving devices behind to ensure maximum physical and mental output.',
                mindsetRule: 'Champions play as they practice.',
                habits: [
                    'Compartmentalized focus blocks',
                    'Positive self-talk and affirmation',
                    'Screen-free family time'
                ],
                quote: 'I don\'t like to lose — at anything.',
                quoteAuthor: 'Serena Williams'
            },
            {
                id: 'ronaldo',
                name: 'Cristiano Ronaldo',
                title: 'Cristiano Ronaldo – Relentless Consistency',
                category: 'Sports Icons (Global)',
                dailyStructure: [
                    'Strict polyphasic sleep measurements for recovery.',
                    'Training sessions are non-negotiable and precise.',
                    'Diet is calculated for fuel, not pleasure.',
                    'Recovers with cryotherapy and cold plunges.'
                ],
                screenTimeDiscipline: 'Maintains elite discipline by avoiding late-night screens that disrupt sleep and recovery.',
                mindsetRule: 'Talent without working hard is nothing.',
                habits: [
                    'Prioritizing sleep above all',
                    'Consistent routine regardless of location',
                    'Discipline over motivation'
                ],
                quote: 'I don’t have to show anything to anyone. There is nothing to prove.',
                quoteAuthor: 'Cristiano Ronaldo'
            }
        ]
    },
    {
        id: 'thinkers',
        title: 'Thinkers & Science',
        description: 'Clarity, solitude, deep thinking',
        routines: [
            {
                id: 'kalam',
                name: 'APJ Abdul Kalam',
                title: 'APJ Abdul Kalam – Simplicity & Focus',
                category: 'Thinkers & Science',
                dailyStructure: [
                    'Started day early with Veena practice.',
                    'Lived a minimalist life with few possessions.',
                    'Dedicated hours to reading and teaching.',
                    'Interacted with youth to share knowledge.'
                ],
                screenTimeDiscipline: 'Lived a life of low information noise, focusing on books, nature, and human connection over distractions.',
                mindsetRule: 'You have to dream before your dreams can come true.',
                habits: [
                    'Minimalist living',
                    'Daily reading habit',
                    'Connecting with people directly'
                ],
                quote: 'Man needs his difficulties because they are necessary to enjoy success.',
                quoteAuthor: 'APJ Abdul Kalam'
            },
            {
                id: 'einstein',
                name: 'Albert Einstein',
                title: 'Albert Einstein – Deep Thought & Solitude',
                category: 'Thinkers & Science',
                dailyStructure: [
                    'Valued solitude for deep thinking experiments.',
                    'Took long walks to let the mind wander.',
                    'Played violin to break mental deadlocks.',
                    'Slept 10 hours a day to fuel brain power.'
                ],
                screenTimeDiscipline: 'Embraced solitude and quiet to allow complex ideas to form, free from trivial interruptions.',
                mindsetRule: 'Imagination is more important than knowledge.',
                habits: [
                    'Long walks without distraction',
                    'Prioritizing solitude',
                    'Creative hobbies to rest the mind'
                ],
                quote: 'I have no special talent. I am only passionately curious.',
                quoteAuthor: 'Albert Einstein'
            },
            {
                id: 'naval',
                name: 'Naval Ravikant',
                title: 'Naval Ravikant – Mental Clarity & Low Information Diet',
                category: 'Thinkers & Science',
                dailyStructure: [
                    'Reads for hours, but only what interests him.',
                    'Prioritizes meditation and doing nothing.',
                    'Avoids news and temporal noise.',
                    'Work feels like play to him.'
                ],
                screenTimeDiscipline: 'Advocates for a low-information diet, ignoring the news cycle to maintain peace of mind.',
                mindsetRule: 'A busy mind accelerates the passage of time.',
                habits: [
                    'The art of doing nothing',
                    'Reading timeless books over news',
                    'ruthless prioritization of peace'
                ]
            }
        ]
    },
    {
        id: 'historical',
        title: 'Historical Indian Greats',
        description: 'Awareness, self-restraint',
        routines: [
            {
                id: 'buddha',
                name: 'Bhagwan Buddha',
                title: 'Bhagwan Buddha – Awareness & Detachment',
                category: 'Historical Indian Greats',
                dailyStructure: [
                    'Practiced mindfulness in every action.',
                    'Meditated deeply to understand the nature of mind.',
                    'Taught the value of minimal desires.',
                    'Lived in the present moment completely.'
                ],
                screenTimeDiscipline: 'The ultimate example of detaching from sensory overload to find inner peace and clarity.',
                mindsetRule: 'Peace comes from within. Do not seek it without.',
                habits: [
                    'Mindfulness in daily tasks',
                    'Detachment from external validation',
                    'Daily meditation'
                ]
            },
            {
                id: 'chanakya',
                name: 'Chanakya',
                title: 'Chanakya – Discipline & Strategy',
                category: 'Historical Indian Greats',
                dailyStructure: [
                    'Rose before sunrise to plan the day.',
                    'Believed in strict self-control for leaders.',
                    'Constantly studied statecraft and philosophy.',
                    'Valued knowledge above material wealth.'
                ],
                screenTimeDiscipline: 'Emphasized control over the senses; a disciplined mind is not swayed by distractions or temporary pleasures.',
                mindsetRule: 'A man is great by deeds, not by birth.',
                habits: [
                    'Early rising',
                    'Continuous study and learning',
                    'Strict self-discipline'
                ]
            },
            {
                id: 'vivekananda',
                name: 'Swami Vivekananda',
                title: 'Swami Vivekananda – Inner Strength & Control',
                category: 'Historical Indian Greats',
                dailyStructure: [
                    'Intense meditation and concentration.',
                    'Read rapidly with full focus.',
                    'Physical fitness to support a strong mind.',
                    'Service to others as a form of worship.'
                ],
                screenTimeDiscipline: 'Practiced absolute concentration; the ability to focus the mind on one point to the exclusion of all else.',
                mindsetRule: 'Arise, awake, and stop not till the goal is reached.',
                habits: [
                    'Concentration exercises',
                    'Reading with full attention',
                    'Physical and mental strength training'
                ]
            },
            {
                id: 'gandhi',
                name: 'Mahatma Gandhi',
                title: 'Mahatma Gandhi – Simplicity & Self-Restraint',
                category: 'Historical Indian Greats',
                dailyStructure: [
                    'Strict adherence to truth and non-violence.',
                    'Spun khadi daily as a meditative discipline.',
                    'Fasted to purify the body and mind.',
                    'Maintains silence (Maun Vrat) to conserve energy.'
                ],
                screenTimeDiscipline: 'Practiced deliberate silence and simplicity to avoid the chaos of unnecessary words and stimuli.',
                mindsetRule: 'Be the change that you wish to see in the world.',
                habits: [
                    'Practicing silence',
                    'Simple living',
                    'Manual work for grounding'
                ],
                quote: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
                quoteAuthor: 'Mahatma Gandhi'
            }
        ]
    }
];
