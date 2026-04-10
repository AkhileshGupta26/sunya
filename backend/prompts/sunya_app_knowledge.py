APP_OVERVIEW = """
Sunya is a mindfulness and digital-discipline app built around calm mornings, daily meditation, yoga practice,
digital detox sessions, streaks, circles, contests, reflective AI guidance, and progress tracking.
The app supports both guest mode and signed-in mode. Signed-in users can save progress, join circles, and compete.
""".strip()

SCREEN_GUIDE = [
    {
        "screen": "Login",
        "route": "/auth/login",
        "summary": "Sign in to an existing Sunya account.",
        "actions": ["Enter email and password", "Go to register if new"],
    },
    {
        "screen": "Register",
        "route": "/auth/register",
        "summary": "Create a Sunya account and begin the journey.",
        "actions": ["Create profile", "Choose gender theme", "Enter credentials"],
    },
    {
        "screen": "Home",
        "route": "/(tabs)/home",
        "summary": "Main dashboard with streaks, daily focus, yoga, detox shortcuts, and the floating Yogi button.",
        "actions": ["Open meditation flow", "Open yoga", "Start detox", "Refresh stats"],
    },
    {
        "screen": "Wake Up",
        "route": "/wake-up",
        "summary": "Shows the sacred morning grace period before meditation.",
        "actions": ["Continue to meditation", "Return home"],
    },
    {
        "screen": "Meditation",
        "route": "/meditation",
        "summary": "Pick a track, set duration, meditate, pass awareness checks, and finish into detox mode.",
        "actions": ["Choose track", "Set 5/10/20 minutes", "Pause or resume", "Complete session"],
    },
    {
        "screen": "Yoga",
        "route": "/yoga",
        "summary": "Guided step-by-step yoga and breathwork practices.",
        "actions": ["Select practice", "Follow steps", "Finish session"],
    },
    {
        "screen": "Digital Detox",
        "route": "/detox",
        "summary": "Phone-free challenge with a visible countdown and detox streak rewards.",
        "actions": ["Choose duration", "Start strict mode", "Complete for points"],
    },
    {
        "screen": "Contest Arena",
        "route": "/(tabs)/contest",
        "summary": "Weekly contest, 21-day challenge, routines of greatness, and social circles.",
        "actions": ["Join contests", "Open leaderboard", "Create circle", "Join circle"],
    },
    {
        "screen": "Leaderboard",
        "route": "/leaderboard",
        "summary": "Global, weekly, and monthly rankings.",
        "actions": ["Switch tabs", "Pull to refresh"],
    },
    {
        "screen": "Routines of Greatness",
        "route": "/routines",
        "summary": "Curated routines inspired by leaders, athletes, thinkers, and Indian icons.",
        "actions": ["Browse categories", "Open routine detail"],
    },
    {
        "screen": "Profile",
        "route": "/(tabs)/profile",
        "summary": "Profile editing, permissions, meditation verification, wake time, notifications, badges, and journey reflection.",
        "actions": ["Edit name/theme", "Toggle settings", "Read About", "Open privacy policy"],
    },
    {
        "screen": "Yogi",
        "route": "/yogi",
        "summary": "Conversational AI mentor for emotional guidance and app help.",
        "actions": ["Ask a question", "Open Vedic search"],
    },
    {
        "screen": "Vedic Search",
        "route": "/vedic-search",
        "summary": "Deep scripture-style answers, verses, meaning, and practical steps.",
        "actions": ["Search a topic", "Copy wisdom"],
    },
]

FEATURES = [
    {
        "name": "Daily Meditation",
        "keywords": ["meditation", "track", "session", "awareness", "bpm", "timer"],
        "details": [
            "Users choose tracks such as Sunya Silence, Om Awareness, Cosmic Universe, Rainfall, Forest Presence, Bird Chirping, Beauty, Ocean, and Flute Music.",
            "Meditation supports 5, 10, or 20 minute durations.",
            "Sessions may trigger an awareness probe asking if the user is still present.",
            "If BPM check is enabled, users are routed through BPM verification before or after meditation.",
            "A completed meditation can suggest an auto-start detox session.",
        ],
    },
    {
        "name": "Yoga Practice",
        "keywords": ["yoga", "nadi", "hatha", "vinyasa", "yin", "breathing"],
        "details": [
            "Yoga includes Nadi Shodhana, Hatha Yoga, Vinyasa Flow, and Yin Yoga.",
            "Each practice is step-based and can be completed inside the app.",
            "Yoga completion records a session but does not drive meditation streak logic the same way meditation does.",
        ],
    },
    {
        "name": "Digital Detox",
        "keywords": ["detox", "strict mode", "phone-free", "disconnect"],
        "details": [
            "Users can start detox sessions for 30, 60, 90, or 120 minutes.",
            "While active, the app shows a strict-mode countdown.",
            "Completing detox awards points and can increase the detox streak once per day.",
        ],
    },
    {
        "name": "Contests",
        "keywords": ["contest", "weekly", "monthly", "challenge", "leaderboard"],
        "details": [
            "Weekly Contest is a recurring competitive mode with weekly points.",
            "21-Day Challenge is stored under the monthly contest path and focuses on habit-building consistency.",
            "Leaderboards support global, weekly, and monthly ranking views.",
            "Claim rewards can unlock badges.",
        ],
    },
    {
        "name": "Social Circles",
        "keywords": ["circle", "family", "friends", "code", "join", "create", "harmony"],
        "details": [
            "Users can create or join a circle using a 6-digit code.",
            "A user can belong to only one circle at a time.",
            "Circles track a harmony score based on how many members completed today's session.",
            "Users can leave circles and invite others by sharing the circle code.",
        ],
    },
    {
        "name": "Routines of Greatness",
        "keywords": ["routine", "greatness", "ceo", "cricket", "buddha", "vivekananda"],
        "details": [
            "Routines are grouped into CEOs & Business Leaders, Cricket Legends, Sports Icons, Thinkers & Science, and Historical Indian Greats.",
            "Examples include Mark Zuckerberg, Jeff Bezos, Elon Musk, Satya Nadella, Sachin Tendulkar, Virat Kohli, MS Dhoni, APJ Abdul Kalam, Einstein, Naval Ravikant, Buddha, Chanakya, Swami Vivekananda, and Mahatma Gandhi.",
            "Each routine includes daily structure, screen-time discipline, habits, and a mindset rule.",
        ],
    },
    {
        "name": "Profile and Settings",
        "keywords": ["profile", "wake time", "notification", "camera", "bpm", "gender", "badge", "zen pass"],
        "details": [
            "Users can edit display name and gender theme.",
            "Profile includes wake time, notifications, camera permission, BPM check, and timer check.",
            "Zen Passes are earned every 10 meditation streak days and can protect a streak when a day is missed.",
            "The profile screen also includes About, Privacy Policy, and AI Journey Reflection.",
        ],
    },
]

FAQS = [
    {
        "question": "How do I start meditating?",
        "answer": "Open Home or Wake Up, go to Meditation, choose a track, pick a duration, and tap Begin Meditation.",
        "keywords": ["start meditating", "begin meditation", "meditate"],
    },
    {
        "question": "How do I join a circle?",
        "answer": "Open Contest Arena, go to Social Circle, choose Join Circle, and enter the 6-digit circle code. If you are already in a circle, you need to leave it first.",
        "keywords": ["join circle", "circle code", "family circle"],
    },
    {
        "question": "How do I create a circle?",
        "answer": "Open Contest Arena, choose Create Circle, enter a circle name, and share the generated code with others.",
        "keywords": ["create circle", "make circle"],
    },
    {
        "question": "How does detox work?",
        "answer": "Digital Detox lets you choose a duration and enter strict mode. Completing a detox awards points and can grow your detox streak.",
        "keywords": ["detox", "strict mode", "digital detox"],
    },
    {
        "question": "What are Zen Passes?",
        "answer": "Zen Passes are streak protection credits earned every 10 meditation streak days. They can save your streak if you miss a day.",
        "keywords": ["zen pass", "streak save", "pass"],
    },
    {
        "question": "What is the 21-day challenge?",
        "answer": "The 21-Day Challenge is the long-form consistency contest in Contest Arena. Internally it uses the monthly contest track and focuses on building a daily habit.",
        "keywords": ["21 day challenge", "monthly contest", "challenge"],
    },
    {
        "question": "Why am I in guest mode?",
        "answer": "Guest mode lets you explore the app, but progress is not fully account-backed. Sign up to save stats and join circles.",
        "keywords": ["guest mode", "guest", "sign up"],
    },
    {
        "question": "Where do I change wake time and settings?",
        "answer": "Open Profile to change wake time, notifications, camera access, meditation verification settings, and your gender theme.",
        "keywords": ["wake time", "settings", "profile", "notifications"],
    },
]


def build_app_knowledge_text() -> str:
    screen_lines = []
    for screen in SCREEN_GUIDE:
        actions = ", ".join(screen["actions"])
        screen_lines.append(
            f"- {screen['screen']} ({screen['route']}): {screen['summary']} Actions: {actions}."
        )

    feature_lines = []
    for feature in FEATURES:
        detail_text = " ".join(feature["details"])
        feature_lines.append(f"- {feature['name']}: {detail_text}")

    faq_lines = []
    for faq in FAQS:
        faq_lines.append(f"- Q: {faq['question']} A: {faq['answer']}")

    return "\n".join(
        [
            "SUNYA APP OVERVIEW",
            APP_OVERVIEW,
            "",
            "SCREEN DIRECTORY",
            *screen_lines,
            "",
            "FEATURES",
            *feature_lines,
            "",
            "FAQ",
            *faq_lines,
        ]
    )


APP_KNOWLEDGE_TEXT = build_app_knowledge_text()
