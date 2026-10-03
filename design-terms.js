/**
 * Design Chain — designer + AI compound-term dataset
 * 920 term pairs. Ranks 1–821 are the original set, roughly sorted from
 * easiest to hardest; ranks 822–902 were added later (see below) and are
 * appended in insertion order rather than interleaved by difficulty — rank
 * is just an identifier here, nothing in the game logic depends on it or on
 * array order.
 *
 * difficulty: "easy" | "moderate" | "hard"
 *   easy     — everyday designer vocabulary, common connecting word
 *   moderate — familiar to working designers, less obvious connection
 *   hard     — specialist jargon (print, type anatomy, AI/ML internals, research methods)
 *
 * Each entry: first + second = term. The game shows `first` as the main word and the
 * first letter of `second` (plus dashes) as the hint.
 *
 * PROGRESSION (see getNextRound):
 *   Rounds 1–3   → easy only
 *   Rounds 4–6   → 70% moderate, 30% hard
 *   Rounds 7–10  → 40% moderate, 60% hard
 *   Rounds 11+   → 20% moderate, 80% hard
 *
 * Ranks 903–920: current design vocabulary from recent conferences — Apple's
 * WWDC 2025 (Liquid Glass), Figma Config 2026 (code layers, shader fills,
 * the motion timeline), Google I/O's Material 3 Expressive (shape morphing,
 * floating toolbar, state layers, dynamic color), the web platform's
 * Interop 2026 work (container queries, view transitions, scroll timelines,
 * anchor positioning, cascade layers) and role/UX trends (design engineer,
 * multimodal and spatial design). Each is a real term, checked against all
 * existing terms for duplicates; none is category "AI".
 *
 * Ranks 822–902: added to connect "dead end" words — common second words
 * (e.g. "chart", "voice", "map") that weren't themselves the first word of
 * any other term, so a chain landing on them always had to restart. Each of
 * these is a real, verifiable design/UX/typography/tools/print/brand term,
 * deliberately never category "AI" (AI-category terms are excluded from
 * play entirely — see game.js — so one here would defeat the purpose).
 */

const DESIGN_TERMS = [
  {
    "rank": 1,
    "difficulty": "easy",
    "first": "check",
    "second": "in",
    "term": "check-in",
    "category": "Workflow",
    "definition": "Quick meeting to share progress"
  },
  {
    "rank": 2,
    "difficulty": "easy",
    "first": "follow",
    "second": "up",
    "term": "follow-up",
    "category": "Workflow",
    "definition": "Checking back after a meeting or request"
  },
  {
    "rank": 3,
    "difficulty": "easy",
    "first": "feed",
    "second": "back",
    "term": "feedback",
    "category": "Workflow",
    "definition": "Comments and critique shared on a piece of work"
  },
  {
    "rank": 4,
    "difficulty": "easy",
    "first": "lay",
    "second": "out",
    "term": "layout",
    "category": "Layout",
    "definition": "Arrangement of elements on a page or screen"
  },
  {
    "rank": 5,
    "difficulty": "easy",
    "first": "mock",
    "second": "up",
    "term": "mockup",
    "category": "Workflow",
    "definition": "Realistic static representation of a design"
  },
  {
    "rank": 6,
    "difficulty": "easy",
    "first": "thumbs",
    "second": "up",
    "term": "thumbs up",
    "category": "AI",
    "definition": "Quick feedback rating an AI response as good"
  },
  {
    "rank": 7,
    "difficulty": "easy",
    "first": "case",
    "second": "study",
    "term": "case study",
    "category": "Workflow",
    "definition": "Portfolio story explaining a project's process and impact"
  },
  {
    "rank": 8,
    "difficulty": "easy",
    "first": "web",
    "second": "site",
    "term": "website",
    "category": "UI",
    "definition": "Collection of linked pages under one domain"
  },
  {
    "rank": 9,
    "difficulty": "easy",
    "first": "dead",
    "second": "line",
    "term": "deadline",
    "category": "Workflow",
    "definition": "The date by which work must be delivered"
  },
  {
    "rank": 10,
    "difficulty": "easy",
    "first": "design",
    "second": "system",
    "term": "design system",
    "category": "Workflow",
    "definition": "Shared library of components, rules, and tokens"
  },
  {
    "rank": 11,
    "difficulty": "easy",
    "first": "drop",
    "second": "down",
    "term": "dropdown",
    "category": "UI",
    "definition": "Menu that expands to reveal a list of options"
  },
  {
    "rank": 12,
    "difficulty": "easy",
    "first": "pain",
    "second": "point",
    "term": "pain point",
    "category": "UX",
    "definition": "A problem or frustration users experience"
  },
  {
    "rank": 13,
    "difficulty": "easy",
    "first": "landing",
    "second": "page",
    "term": "landing page",
    "category": "UI",
    "definition": "Focused page built for a single campaign or goal"
  },
  {
    "rank": 14,
    "difficulty": "easy",
    "first": "search",
    "second": "bar",
    "term": "search bar",
    "category": "UI",
    "definition": "Input field for entering search queries"
  },
  {
    "rank": 15,
    "difficulty": "easy",
    "first": "progress",
    "second": "bar",
    "term": "progress bar",
    "category": "UI",
    "definition": "Indicator showing how much of a task is done"
  },
  {
    "rank": 16,
    "difficulty": "easy",
    "first": "log",
    "second": "in",
    "term": "login",
    "category": "UX",
    "definition": "Process of accessing an existing account"
  },
  {
    "rank": 17,
    "difficulty": "easy",
    "first": "dash",
    "second": "board",
    "term": "dashboard",
    "category": "UI",
    "definition": "Screen summarizing key data at a glance"
  },
  {
    "rank": 18,
    "difficulty": "easy",
    "first": "web",
    "second": "design",
    "term": "web design",
    "category": "Workflow",
    "definition": "Designing websites and their layouts"
  },
  {
    "rank": 19,
    "difficulty": "easy",
    "first": "home",
    "second": "page",
    "term": "homepage",
    "category": "UI",
    "definition": "Main entry page of a website"
  },
  {
    "rank": 20,
    "difficulty": "easy",
    "first": "light",
    "second": "mode",
    "term": "light mode",
    "category": "UI",
    "definition": "Color theme using dark text on light backgrounds"
  },
  {
    "rank": 21,
    "difficulty": "easy",
    "first": "dark",
    "second": "mode",
    "term": "dark mode",
    "category": "UI",
    "definition": "Color theme using light text on dark backgrounds"
  },
  {
    "rank": 22,
    "difficulty": "easy",
    "first": "stock",
    "second": "photo",
    "term": "stock photo",
    "category": "Brand",
    "definition": "Licensed ready-made photograph"
  },
  {
    "rank": 23,
    "difficulty": "easy",
    "first": "ai",
    "second": "art",
    "term": "AI art",
    "category": "AI",
    "definition": "Artwork created with generative AI"
  },
  {
    "rank": 24,
    "difficulty": "easy",
    "first": "home",
    "second": "screen",
    "term": "home screen",
    "category": "UI",
    "definition": "Main screen of a phone or app"
  },
  {
    "rank": 25,
    "difficulty": "easy",
    "first": "brand",
    "second": "color",
    "term": "brand color",
    "category": "Brand",
    "definition": "Official color associated with a brand"
  },
  {
    "rank": 26,
    "difficulty": "easy",
    "first": "side",
    "second": "bar",
    "term": "sidebar",
    "category": "UI",
    "definition": "Vertical panel beside the main content"
  },
  {
    "rank": 27,
    "difficulty": "easy",
    "first": "back",
    "second": "ground",
    "term": "background",
    "category": "Layout",
    "definition": "Layer or area behind the main content"
  },
  {
    "rank": 28,
    "difficulty": "easy",
    "first": "ease",
    "second": "in",
    "term": "ease in",
    "category": "Motion",
    "definition": "Animation that starts slowly and speeds up"
  },
  {
    "rank": 29,
    "difficulty": "easy",
    "first": "primary",
    "second": "color",
    "term": "primary color",
    "category": "Color",
    "definition": "Main color defining a brand or interface"
  },
  {
    "rank": 30,
    "difficulty": "easy",
    "first": "tool",
    "second": "bar",
    "term": "toolbar",
    "category": "UI",
    "definition": "Row of buttons giving quick access to actions"
  },
  {
    "rank": 31,
    "difficulty": "easy",
    "first": "check",
    "second": "box",
    "term": "checkbox",
    "category": "UI",
    "definition": "Control for selecting one or more options"
  },
  {
    "rank": 32,
    "difficulty": "easy",
    "first": "style",
    "second": "guide",
    "term": "style guide",
    "category": "Brand",
    "definition": "Rules for consistent visual and written style"
  },
  {
    "rank": 33,
    "difficulty": "easy",
    "first": "road",
    "second": "map",
    "term": "roadmap",
    "category": "Workflow",
    "definition": "Plan of upcoming product features and priorities"
  },
  {
    "rank": 34,
    "difficulty": "easy",
    "first": "head",
    "second": "line",
    "term": "headline",
    "category": "Typography",
    "definition": "Main title text of a page or article"
  },
  {
    "rank": 35,
    "difficulty": "easy",
    "first": "graphic",
    "second": "design",
    "term": "graphic design",
    "category": "Brand",
    "definition": "Visual communication using type, image, and color"
  },
  {
    "rank": 36,
    "difficulty": "easy",
    "first": "design",
    "second": "thinking",
    "term": "design thinking",
    "category": "Workflow",
    "definition": "Human-centered problem-solving method: empathize, define, ideate, test"
  },
  {
    "rank": 37,
    "difficulty": "easy",
    "first": "screen",
    "second": "shot",
    "term": "screenshot",
    "category": "Tools",
    "definition": "Captured image of what's on a display"
  },
  {
    "rank": 38,
    "difficulty": "easy",
    "first": "work",
    "second": "flow",
    "term": "workflow",
    "category": "Workflow",
    "definition": "Sequence of steps a team follows to finish design work"
  },
  {
    "rank": 39,
    "difficulty": "easy",
    "first": "slide",
    "second": "deck",
    "term": "slide deck",
    "category": "Workflow",
    "definition": "Set of presentation slides"
  },
  {
    "rank": 40,
    "difficulty": "easy",
    "first": "accent",
    "second": "color",
    "term": "accent color",
    "category": "Color",
    "definition": "Color used sparingly to highlight key elements"
  },
  {
    "rank": 41,
    "difficulty": "easy",
    "first": "pixel",
    "second": "perfect",
    "term": "pixel perfect",
    "category": "Workflow",
    "definition": "Built exactly matching the design, down to each pixel"
  },
  {
    "rank": 42,
    "difficulty": "easy",
    "first": "radio",
    "second": "button",
    "term": "radio button",
    "category": "UI",
    "definition": "Control for choosing exactly one option from a set"
  },
  {
    "rank": 43,
    "difficulty": "easy",
    "first": "story",
    "second": "board",
    "term": "storyboard",
    "category": "UX",
    "definition": "Sequence of sketches showing a scenario step by step"
  },
  {
    "rank": 44,
    "difficulty": "easy",
    "first": "brain",
    "second": "storm",
    "term": "brainstorm",
    "category": "Workflow",
    "definition": "Group session for generating many ideas quickly"
  },
  {
    "rank": 45,
    "difficulty": "easy",
    "first": "user",
    "second": "flow",
    "term": "user flow",
    "category": "UX",
    "definition": "Path a user takes to complete a task"
  },
  {
    "rank": 46,
    "difficulty": "easy",
    "first": "white",
    "second": "space",
    "term": "whitespace",
    "category": "Layout",
    "definition": "Empty space around and between elements"
  },
  {
    "rank": 47,
    "difficulty": "easy",
    "first": "font",
    "second": "family",
    "term": "font family",
    "category": "Typography",
    "definition": "Related set of weights and styles of one typeface"
  },
  {
    "rank": 48,
    "difficulty": "easy",
    "first": "ai",
    "second": "agent",
    "term": "AI agent",
    "category": "AI",
    "definition": "AI that plans and takes actions toward a goal"
  },
  {
    "rank": 49,
    "difficulty": "easy",
    "first": "chat",
    "second": "history",
    "term": "chat history",
    "category": "AI",
    "definition": "Record of previous conversations"
  },
  {
    "rank": 50,
    "difficulty": "easy",
    "first": "work",
    "second": "space",
    "term": "workspace",
    "category": "Tools",
    "definition": "Arranged panels and canvas area where you design"
  },
  {
    "rank": 51,
    "difficulty": "easy",
    "first": "drop",
    "second": "shadow",
    "term": "drop shadow",
    "category": "UI",
    "definition": "Shadow cast behind an element to add depth"
  },
  {
    "rank": 52,
    "difficulty": "easy",
    "first": "nav",
    "second": "bar",
    "term": "navbar",
    "category": "UI",
    "definition": "Bar containing primary navigation links"
  },
  {
    "rank": 53,
    "difficulty": "easy",
    "first": "lower",
    "second": "case",
    "term": "lowercase",
    "category": "Typography",
    "definition": "Small letters"
  },
  {
    "rank": 54,
    "difficulty": "easy",
    "first": "fore",
    "second": "ground",
    "term": "foreground",
    "category": "Layout",
    "definition": "Elements closest to the viewer, in front"
  },
  {
    "rank": 55,
    "difficulty": "easy",
    "first": "app",
    "second": "icon",
    "term": "app icon",
    "category": "UI",
    "definition": "Image representing an app on the home screen"
  },
  {
    "rank": 56,
    "difficulty": "easy",
    "first": "voice",
    "second": "mode",
    "term": "voice mode",
    "category": "AI",
    "definition": "Talking to AI instead of typing"
  },
  {
    "rank": 57,
    "difficulty": "easy",
    "first": "bar",
    "second": "chart",
    "term": "bar chart",
    "category": "Layout",
    "definition": "Chart comparing values with rectangular bars"
  },
  {
    "rank": 58,
    "difficulty": "easy",
    "first": "book",
    "second": "cover",
    "term": "book cover",
    "category": "Print",
    "definition": "Designed outer face of a book"
  },
  {
    "rank": 59,
    "difficulty": "easy",
    "first": "business",
    "second": "card",
    "term": "business card",
    "category": "Print",
    "definition": "Small card with personal contact details"
  },
  {
    "rank": 60,
    "difficulty": "easy",
    "first": "type",
    "second": "face",
    "term": "typeface",
    "category": "Typography",
    "definition": "Design of a set of letters, like Helvetica"
  },
  {
    "rank": 61,
    "difficulty": "easy",
    "first": "color",
    "second": "wheel",
    "term": "color wheel",
    "category": "Color",
    "definition": "Circle arranging hues to show their relationships"
  },
  {
    "rank": 62,
    "difficulty": "easy",
    "first": "upper",
    "second": "case",
    "term": "uppercase",
    "category": "Typography",
    "definition": "Capital letters"
  },
  {
    "rank": 63,
    "difficulty": "easy",
    "first": "mood",
    "second": "board",
    "term": "moodboard",
    "category": "Brand",
    "definition": "Collage of images setting a project's visual tone"
  },
  {
    "rank": 64,
    "difficulty": "easy",
    "first": "hamburger",
    "second": "menu",
    "term": "hamburger menu",
    "category": "UI",
    "definition": "Three-line icon that opens hidden navigation"
  },
  {
    "rank": 65,
    "difficulty": "easy",
    "first": "pie",
    "second": "chart",
    "term": "pie chart",
    "category": "Layout",
    "definition": "Circle divided into slices showing proportions"
  },
  {
    "rank": 66,
    "difficulty": "easy",
    "first": "font",
    "second": "size",
    "term": "font size",
    "category": "Typography",
    "definition": "How large text is displayed"
  },
  {
    "rank": 67,
    "difficulty": "easy",
    "first": "pitch",
    "second": "deck",
    "term": "pitch deck",
    "category": "Brand",
    "definition": "Short presentation used to win clients or funding"
  },
  {
    "rank": 68,
    "difficulty": "easy",
    "first": "golden",
    "second": "ratio",
    "term": "golden ratio",
    "category": "Layout",
    "definition": "Proportion of about 1.618 used for pleasing balance"
  },
  {
    "rank": 69,
    "difficulty": "easy",
    "first": "user",
    "second": "research",
    "term": "user research",
    "category": "UX",
    "definition": "Studying users to understand their needs and behavior"
  },
  {
    "rank": 70,
    "difficulty": "easy",
    "first": "success",
    "second": "message",
    "term": "success message",
    "category": "UX",
    "definition": "Confirmation that an action completed"
  },
  {
    "rank": 71,
    "difficulty": "easy",
    "first": "photo",
    "second": "shoot",
    "term": "photoshoot",
    "category": "Brand",
    "definition": "Session for capturing images for a project"
  },
  {
    "rank": 72,
    "difficulty": "easy",
    "first": "aspect",
    "second": "ratio",
    "term": "aspect ratio",
    "category": "Layout",
    "definition": "Proportional relationship of width to height"
  },
  {
    "rank": 73,
    "difficulty": "easy",
    "first": "tool",
    "second": "tip",
    "term": "tooltip",
    "category": "UI",
    "definition": "Small hint that appears on hover or focus"
  },
  {
    "rank": 74,
    "difficulty": "easy",
    "first": "thumb",
    "second": "nail",
    "term": "thumbnail",
    "category": "UI",
    "definition": "Small preview image of larger content"
  },
  {
    "rank": 75,
    "difficulty": "easy",
    "first": "toggle",
    "second": "switch",
    "term": "toggle switch",
    "category": "UI",
    "definition": "On/off control that changes a setting instantly"
  },
  {
    "rank": 76,
    "difficulty": "easy",
    "first": "error",
    "second": "message",
    "term": "error message",
    "category": "UX",
    "definition": "Text explaining what went wrong and how to fix it"
  },
  {
    "rank": 77,
    "difficulty": "easy",
    "first": "pen",
    "second": "tool",
    "term": "pen tool",
    "category": "Tools",
    "definition": "Tool for drawing precise vector paths with anchor points"
  },
  {
    "rank": 78,
    "difficulty": "easy",
    "first": "contrast",
    "second": "ratio",
    "term": "contrast ratio",
    "category": "UX",
    "definition": "Measured difference in brightness between text and background"
  },
  {
    "rank": 79,
    "difficulty": "easy",
    "first": "color",
    "second": "scheme",
    "term": "color scheme",
    "category": "Color",
    "definition": "Planned combination of colors"
  },
  {
    "rank": 80,
    "difficulty": "easy",
    "first": "gray",
    "second": "scale",
    "term": "grayscale",
    "category": "Color",
    "definition": "Image made only of shades of grey"
  },
  {
    "rank": 81,
    "difficulty": "easy",
    "first": "art",
    "second": "board",
    "term": "artboard",
    "category": "Tools",
    "definition": "A canvas frame representing one screen or page"
  },
  {
    "rank": 82,
    "difficulty": "easy",
    "first": "heat",
    "second": "map",
    "term": "heatmap",
    "category": "UX",
    "definition": "Visualization of where users click, scroll, or look"
  },
  {
    "rank": 83,
    "difficulty": "easy",
    "first": "font",
    "second": "weight",
    "term": "font weight",
    "category": "Typography",
    "definition": "Thickness of a font, from thin to black"
  },
  {
    "rank": 84,
    "difficulty": "easy",
    "first": "user",
    "second": "testing",
    "term": "user testing",
    "category": "UX",
    "definition": "Watching real users try a design to find problems"
  },
  {
    "rank": 85,
    "difficulty": "easy",
    "first": "stake",
    "second": "holder",
    "term": "stakeholder",
    "category": "Workflow",
    "definition": "Anyone with an interest in the project's outcome"
  },
  {
    "rank": 86,
    "difficulty": "easy",
    "first": "user",
    "second": "journey",
    "term": "user journey",
    "category": "UX",
    "definition": "Full sequence of steps a user takes"
  },
  {
    "rank": 87,
    "difficulty": "easy",
    "first": "flow",
    "second": "chart",
    "term": "flowchart",
    "category": "UX",
    "definition": "Diagram showing steps and decisions in a process"
  },
  {
    "rank": 88,
    "difficulty": "easy",
    "first": "copy",
    "second": "writing",
    "term": "copywriting",
    "category": "Brand",
    "definition": "Writing persuasive text for marketing and products"
  },
  {
    "rank": 89,
    "difficulty": "easy",
    "first": "place",
    "second": "holder",
    "term": "placeholder",
    "category": "UI",
    "definition": "Temporary text or image showing where content goes"
  },
  {
    "rank": 90,
    "difficulty": "easy",
    "first": "site",
    "second": "map",
    "term": "sitemap",
    "category": "UX",
    "definition": "Hierarchy of all pages in a website"
  },
  {
    "rank": 91,
    "difficulty": "easy",
    "first": "dark",
    "second": "pattern",
    "term": "dark pattern",
    "category": "UX",
    "definition": "Deceptive design that tricks users into actions"
  },
  {
    "rank": 92,
    "difficulty": "easy",
    "first": "wire",
    "second": "frame",
    "term": "wireframe",
    "category": "UX",
    "definition": "Low-fidelity layout sketch of a screen"
  },
  {
    "rank": 93,
    "difficulty": "easy",
    "first": "deep",
    "second": "learning",
    "term": "deep learning",
    "category": "AI",
    "definition": "Machine learning using many-layered neural networks"
  },
  {
    "rank": 94,
    "difficulty": "easy",
    "first": "machine",
    "second": "learning",
    "term": "machine learning",
    "category": "AI",
    "definition": "Systems that learn patterns from data"
  },
  {
    "rank": 95,
    "difficulty": "easy",
    "first": "brand",
    "second": "identity",
    "term": "brand identity",
    "category": "Brand",
    "definition": "All visual elements that represent a brand"
  },
  {
    "rank": 96,
    "difficulty": "easy",
    "first": "line",
    "second": "height",
    "term": "line height",
    "category": "Typography",
    "definition": "Vertical distance between lines of text"
  },
  {
    "rank": 97,
    "difficulty": "easy",
    "first": "deep",
    "second": "fake",
    "term": "deepfake",
    "category": "AI",
    "definition": "Realistic AI-faked video or audio of a real person"
  },
  {
    "rank": 98,
    "difficulty": "easy",
    "first": "generative",
    "second": "ai",
    "term": "generative AI",
    "category": "AI",
    "definition": "AI that creates new content"
  },
  {
    "rank": 99,
    "difficulty": "easy",
    "first": "fade",
    "second": "in",
    "term": "fade in",
    "category": "Motion",
    "definition": "Element gradually appearing from transparent"
  },
  {
    "rank": 100,
    "difficulty": "easy",
    "first": "all",
    "second": "caps",
    "term": "all caps",
    "category": "Typography",
    "definition": "Text set entirely in capital letters"
  },
  {
    "rank": 101,
    "difficulty": "easy",
    "first": "background",
    "second": "removal",
    "term": "background removal",
    "category": "AI",
    "definition": "AI cutting a subject out from its background"
  },
  {
    "rank": 102,
    "difficulty": "easy",
    "first": "user",
    "second": "interview",
    "term": "user interview",
    "category": "UX",
    "definition": "One-on-one conversation to learn about users"
  },
  {
    "rank": 103,
    "difficulty": "easy",
    "first": "voice",
    "second": "assistant",
    "term": "voice assistant",
    "category": "AI",
    "definition": "AI you talk to by speaking"
  },
  {
    "rank": 104,
    "difficulty": "easy",
    "first": "info",
    "second": "graphic",
    "term": "infographic",
    "category": "Layout",
    "definition": "Visual that presents information or data clearly"
  },
  {
    "rank": 105,
    "difficulty": "easy",
    "first": "ai",
    "second": "assistant",
    "term": "AI assistant",
    "category": "AI",
    "definition": "AI helping with tasks through conversation"
  },
  {
    "rank": 106,
    "difficulty": "easy",
    "first": "user",
    "second": "interface",
    "term": "user interface",
    "category": "UI",
    "definition": "Everything a person sees and interacts with on screen"
  },
  {
    "rank": 107,
    "difficulty": "easy",
    "first": "vibe",
    "second": "coding",
    "term": "vibe coding",
    "category": "AI",
    "definition": "Building software by describing it to AI"
  },
  {
    "rank": 108,
    "difficulty": "easy",
    "first": "chat",
    "second": "bot",
    "term": "chatbot",
    "category": "AI",
    "definition": "Program that converses with users through text"
  },
  {
    "rank": 109,
    "difficulty": "easy",
    "first": "text",
    "second": "generation",
    "term": "text generation",
    "category": "AI",
    "definition": "AI writing text from a prompt"
  },
  {
    "rank": 110,
    "difficulty": "easy",
    "first": "image",
    "second": "generation",
    "term": "image generation",
    "category": "AI",
    "definition": "Creating pictures from text or other inputs"
  },
  {
    "rank": 111,
    "difficulty": "easy",
    "first": "color",
    "second": "palette",
    "term": "color palette",
    "category": "Color",
    "definition": "Chosen set of colors for a design"
  },
  {
    "rank": 112,
    "difficulty": "easy",
    "first": "loading",
    "second": "spinner",
    "term": "loading spinner",
    "category": "UI",
    "definition": "Rotating icon shown while waiting"
  },
  {
    "rank": 113,
    "difficulty": "easy",
    "first": "plug",
    "second": "in",
    "term": "plugin",
    "category": "Tools",
    "definition": "Add-on that extends a design tool's features"
  },
  {
    "rank": 114,
    "difficulty": "easy",
    "first": "bread",
    "second": "crumb",
    "term": "breadcrumb",
    "category": "UI",
    "definition": "Trail of links showing your location in a hierarchy"
  },
  {
    "rank": 115,
    "difficulty": "easy",
    "first": "user",
    "second": "persona",
    "term": "user persona",
    "category": "UX",
    "definition": "Fictional profile representing a key user group"
  },
  {
    "rank": 116,
    "difficulty": "easy",
    "first": "date",
    "second": "picker",
    "term": "date picker",
    "category": "UI",
    "definition": "Control for choosing a date from a calendar"
  },
  {
    "rank": 117,
    "difficulty": "easy",
    "first": "ai",
    "second": "generated",
    "term": "AI generated",
    "category": "AI",
    "definition": "Made by artificial intelligence"
  },
  {
    "rank": 118,
    "difficulty": "easy",
    "first": "face",
    "second": "detection",
    "term": "face detection",
    "category": "AI",
    "definition": "Locating faces within an image or video"
  },
  {
    "rank": 119,
    "difficulty": "easy",
    "first": "prompt",
    "second": "engineering",
    "term": "prompt engineering",
    "category": "AI",
    "definition": "Crafting instructions to get better results from AI"
  },
  {
    "rank": 120,
    "difficulty": "easy",
    "first": "visual",
    "second": "hierarchy",
    "term": "visual hierarchy",
    "category": "Layout",
    "definition": "Arranging elements to show order of importance"
  },
  {
    "rank": 121,
    "difficulty": "easy",
    "first": "on",
    "second": "boarding",
    "term": "onboarding",
    "category": "UX",
    "definition": "First-run experience introducing a product to new users"
  },
  {
    "rank": 122,
    "difficulty": "easy",
    "first": "logo",
    "second": "generator",
    "term": "logo generator",
    "category": "AI",
    "definition": "Tool producing logo concepts from a prompt"
  },
  {
    "rank": 123,
    "difficulty": "easy",
    "first": "high",
    "second": "fidelity",
    "term": "high fidelity",
    "category": "UX",
    "definition": "Detailed and polished, close to the final product"
  },
  {
    "rank": 124,
    "difficulty": "easy",
    "first": "low",
    "second": "fidelity",
    "term": "low fidelity",
    "category": "UX",
    "definition": "Rough and simple, focused on structure"
  },
  {
    "rank": 125,
    "difficulty": "easy",
    "first": "typing",
    "second": "indicator",
    "term": "typing indicator",
    "category": "AI",
    "definition": "Animated dots showing a reply is coming"
  },
  {
    "rank": 126,
    "difficulty": "easy",
    "first": "ai",
    "second": "slop",
    "term": "AI slop",
    "category": "AI",
    "definition": "Low-quality, generic AI-generated content"
  },
  {
    "rank": 127,
    "difficulty": "easy",
    "first": "color",
    "second": "picker",
    "term": "color picker",
    "category": "Tools",
    "definition": "Control for selecting a precise color"
  },
  {
    "rank": 128,
    "difficulty": "easy",
    "first": "line",
    "second": "spacing",
    "term": "line spacing",
    "category": "Typography",
    "definition": "Space between lines of text, also called leading"
  },
  {
    "rank": 129,
    "difficulty": "easy",
    "first": "letter",
    "second": "spacing",
    "term": "letter spacing",
    "category": "Typography",
    "definition": "Uniform space between all characters in text"
  },
  {
    "rank": 130,
    "difficulty": "easy",
    "first": "push",
    "second": "notification",
    "term": "push notification",
    "category": "UI",
    "definition": "Alert sent to a device from an app"
  },
  {
    "rank": 131,
    "difficulty": "easy",
    "first": "hot",
    "second": "take",
    "term": "hot take",
    "category": "Workflow",
    "definition": "Bold, quick opinion shared in a critique"
  },
  {
    "rank": 132,
    "difficulty": "easy",
    "first": "sign",
    "second": "off",
    "term": "sign-off",
    "category": "Workflow",
    "definition": "Final approval before work moves forward"
  },
  {
    "rank": 133,
    "difficulty": "easy",
    "first": "sans",
    "second": "serif",
    "term": "sans serif",
    "category": "Typography",
    "definition": "Typeface without small strokes at letter ends"
  },
  {
    "rank": 134,
    "difficulty": "easy",
    "first": "sign",
    "second": "up",
    "term": "sign up",
    "category": "UX",
    "definition": "Process of creating a new account"
  },
  {
    "rank": 135,
    "difficulty": "easy",
    "first": "eye",
    "second": "dropper",
    "term": "eyedropper",
    "category": "Tools",
    "definition": "Tool that samples a color from anywhere on screen"
  },
  {
    "rank": 136,
    "difficulty": "easy",
    "first": "mark",
    "second": "up",
    "term": "markup",
    "category": "Workflow",
    "definition": "Annotations drawn on a design to give feedback"
  },
  {
    "rank": 137,
    "difficulty": "easy",
    "first": "stand",
    "second": "up",
    "term": "standup",
    "category": "Workflow",
    "definition": "Short daily team meeting on progress"
  },
  {
    "rank": 138,
    "difficulty": "easy",
    "first": "focus",
    "second": "state",
    "term": "focus state",
    "category": "UI",
    "definition": "Styling showing which element is keyboard-selected"
  },
  {
    "rank": 139,
    "difficulty": "easy",
    "first": "frame",
    "second": "work",
    "term": "framework",
    "category": "Workflow",
    "definition": "Underlying structure that guides a design or system"
  },
  {
    "rank": 140,
    "difficulty": "easy",
    "first": "active",
    "second": "state",
    "term": "active state",
    "category": "UI",
    "definition": "How an element looks while being pressed"
  },
  {
    "rank": 141,
    "difficulty": "easy",
    "first": "pop",
    "second": "up",
    "term": "popup",
    "category": "UI",
    "definition": "Window that appears over the current content"
  },
  {
    "rank": 142,
    "difficulty": "easy",
    "first": "use",
    "second": "case",
    "term": "use case",
    "category": "Workflow",
    "definition": "Specific situation in which a product gets used"
  },
  {
    "rank": 143,
    "difficulty": "easy",
    "first": "empty",
    "second": "state",
    "term": "empty state",
    "category": "UI",
    "definition": "Screen shown when there's no content yet"
  },
  {
    "rank": 144,
    "difficulty": "easy",
    "first": "error",
    "second": "state",
    "term": "error state",
    "category": "UI",
    "definition": "How a component shows that something went wrong"
  },
  {
    "rank": 145,
    "difficulty": "easy",
    "first": "mobile",
    "second": "first",
    "term": "mobile first",
    "category": "UX",
    "definition": "Designing for small screens before larger ones"
  },
  {
    "rank": 146,
    "difficulty": "easy",
    "first": "call",
    "second": "out",
    "term": "callout",
    "category": "UI",
    "definition": "Highlighted box or label drawing attention to information"
  },
  {
    "rank": 147,
    "difficulty": "easy",
    "first": "radio",
    "second": "group",
    "term": "radio group",
    "category": "UI",
    "definition": "Set of radio buttons for one choice"
  },
  {
    "rank": 148,
    "difficulty": "easy",
    "first": "loading",
    "second": "state",
    "term": "loading state",
    "category": "UI",
    "definition": "What users see while content is loading"
  },
  {
    "rank": 149,
    "difficulty": "easy",
    "first": "check",
    "second": "out",
    "term": "checkout",
    "category": "UX",
    "definition": "Final steps to complete a purchase"
  },
  {
    "rank": 150,
    "difficulty": "easy",
    "first": "edge",
    "second": "case",
    "term": "edge case",
    "category": "Workflow",
    "definition": "Rare scenario that a design must still handle"
  },
  {
    "rank": 151,
    "difficulty": "easy",
    "first": "kick",
    "second": "off",
    "term": "kickoff",
    "category": "Workflow",
    "definition": "First meeting that starts a project"
  },
  {
    "rank": 152,
    "difficulty": "easy",
    "first": "opt",
    "second": "out",
    "term": "opt-out",
    "category": "AI",
    "definition": "Choosing not to have your work used for training"
  },
  {
    "rank": 153,
    "difficulty": "easy",
    "first": "safe",
    "second": "area",
    "term": "safe area",
    "category": "UI",
    "definition": "Region free from notches and system bars"
  },
  {
    "rank": 154,
    "difficulty": "easy",
    "first": "button",
    "second": "group",
    "term": "button group",
    "category": "UI",
    "definition": "Set of related buttons displayed together"
  },
  {
    "rank": 155,
    "difficulty": "easy",
    "first": "office",
    "second": "hours",
    "term": "office hours",
    "category": "Workflow",
    "definition": "Open time slot for design questions and help"
  },
  {
    "rank": 156,
    "difficulty": "easy",
    "first": "text",
    "second": "area",
    "term": "text area",
    "category": "UI",
    "definition": "Multi-line input for longer text entry"
  },
  {
    "rank": 157,
    "difficulty": "easy",
    "first": "drop",
    "second": "off",
    "term": "drop-off",
    "category": "UX",
    "definition": "Point where users abandon a flow"
  },
  {
    "rank": 158,
    "difficulty": "easy",
    "first": "ease",
    "second": "out",
    "term": "ease out",
    "category": "Motion",
    "definition": "Animation that starts fast and slows to a stop"
  },
  {
    "rank": 159,
    "difficulty": "easy",
    "first": "quick",
    "second": "win",
    "term": "quick win",
    "category": "Workflow",
    "definition": "Easy improvement with noticeable impact"
  },
  {
    "rank": 160,
    "difficulty": "easy",
    "first": "icon",
    "second": "set",
    "term": "icon set",
    "category": "UI",
    "definition": "Collection of icons sharing a consistent style"
  },
  {
    "rank": 161,
    "difficulty": "easy",
    "first": "render",
    "second": "time",
    "term": "render time",
    "category": "AI",
    "definition": "How long AI takes to produce an output"
  },
  {
    "rank": 162,
    "difficulty": "easy",
    "first": "art",
    "second": "work",
    "term": "artwork",
    "category": "Brand",
    "definition": "Finished visual content ready for use"
  },
  {
    "rank": 163,
    "difficulty": "easy",
    "first": "ai",
    "second": "first",
    "term": "AI first",
    "category": "AI",
    "definition": "Strategy putting AI at the center of products"
  },
  {
    "rank": 164,
    "difficulty": "easy",
    "first": "hover",
    "second": "state",
    "term": "hover state",
    "category": "UI",
    "definition": "How an element looks when the cursor is over it"
  },
  {
    "rank": 165,
    "difficulty": "easy",
    "first": "lock",
    "second": "up",
    "term": "lockup",
    "category": "Brand",
    "definition": "Fixed arrangement of logo symbol and text"
  },
  {
    "rank": 166,
    "difficulty": "easy",
    "first": "time",
    "second": "line",
    "term": "timeline",
    "category": "Workflow",
    "definition": "Schedule of project milestones or animation tracks over time"
  },
  {
    "rank": 167,
    "difficulty": "easy",
    "first": "show",
    "second": "case",
    "term": "showcase",
    "category": "Workflow",
    "definition": "Presenting finished work to highlight its best qualities"
  },
  {
    "rank": 168,
    "difficulty": "easy",
    "first": "form",
    "second": "field",
    "term": "form field",
    "category": "UI",
    "definition": "Single input within a form"
  },
  {
    "rank": 169,
    "difficulty": "easy",
    "first": "hand",
    "second": "off",
    "term": "handoff",
    "category": "Workflow",
    "definition": "Passing finished designs and specs to developers"
  },
  {
    "rank": 170,
    "difficulty": "easy",
    "first": "fair",
    "second": "use",
    "term": "fair use",
    "category": "AI",
    "definition": "Legal doctrine allowing limited use of copyrighted work"
  },
  {
    "rank": 171,
    "difficulty": "easy",
    "first": "text",
    "second": "field",
    "term": "text field",
    "category": "UI",
    "definition": "Input for single-line text entry"
  },
  {
    "rank": 172,
    "difficulty": "easy",
    "first": "long",
    "second": "press",
    "term": "long press",
    "category": "UI",
    "definition": "Holding a finger down to reveal more actions"
  },
  {
    "rank": 173,
    "difficulty": "easy",
    "first": "computer",
    "second": "use",
    "term": "computer use",
    "category": "AI",
    "definition": "AI operating software by clicking and typing"
  },
  {
    "rank": 174,
    "difficulty": "easy",
    "first": "list",
    "second": "view",
    "term": "list view",
    "category": "UI",
    "definition": "Content shown as a vertical list of rows"
  },
  {
    "rank": 175,
    "difficulty": "easy",
    "first": "copy",
    "second": "right",
    "term": "copyright",
    "category": "AI",
    "definition": "Legal ownership of creative work"
  },
  {
    "rank": 176,
    "difficulty": "easy",
    "first": "fresh",
    "second": "eyes",
    "term": "fresh eyes",
    "category": "Workflow",
    "definition": "Someone new reviewing work to spot issues"
  },
  {
    "rank": 177,
    "difficulty": "easy",
    "first": "tree",
    "second": "view",
    "term": "tree view",
    "category": "UI",
    "definition": "Nested, expandable list showing hierarchy"
  },
  {
    "rank": 178,
    "difficulty": "easy",
    "first": "tool",
    "second": "use",
    "term": "tool use",
    "category": "AI",
    "definition": "AI calling external tools to complete tasks"
  },
  {
    "rank": 179,
    "difficulty": "easy",
    "first": "mouse",
    "second": "over",
    "term": "mouseover",
    "category": "UI",
    "definition": "Event when the cursor moves over an element"
  },
  {
    "rank": 180,
    "difficulty": "easy",
    "first": "pop",
    "second": "over",
    "term": "popover",
    "category": "UI",
    "definition": "Small floating panel anchored to an element"
  },
  {
    "rank": 181,
    "difficulty": "easy",
    "first": "back",
    "second": "end",
    "term": "backend",
    "category": "Workflow",
    "definition": "Server side of a product that users don't see"
  },
  {
    "rank": 182,
    "difficulty": "easy",
    "first": "screen",
    "second": "size",
    "term": "screen size",
    "category": "UI",
    "definition": "Physical or pixel dimensions of a display"
  },
  {
    "rank": 183,
    "difficulty": "easy",
    "first": "input",
    "second": "field",
    "term": "input field",
    "category": "UI",
    "definition": "Area where users enter data"
  },
  {
    "rank": 184,
    "difficulty": "easy",
    "first": "detail",
    "second": "view",
    "term": "detail view",
    "category": "UI",
    "definition": "Screen showing full information about one item"
  },
  {
    "rank": 185,
    "difficulty": "easy",
    "first": "gut",
    "second": "check",
    "term": "gut check",
    "category": "Workflow",
    "definition": "Quick instinctive judgment on whether something works"
  },
  {
    "rank": 186,
    "difficulty": "easy",
    "first": "vibe",
    "second": "check",
    "term": "vibe check",
    "category": "Workflow",
    "definition": "Quick read on whether something feels right"
  },
  {
    "rank": 187,
    "difficulty": "easy",
    "first": "reading",
    "second": "order",
    "term": "reading order",
    "category": "UX",
    "definition": "Sequence a screen reader follows through content"
  },
  {
    "rank": 188,
    "difficulty": "easy",
    "first": "brand",
    "second": "story",
    "term": "brand story",
    "category": "Brand",
    "definition": "Narrative behind a brand's purpose and values"
  },
  {
    "rank": 189,
    "difficulty": "easy",
    "first": "text",
    "second": "box",
    "term": "text box",
    "category": "UI",
    "definition": "Field where users type text"
  },
  {
    "rank": 190,
    "difficulty": "easy",
    "first": "brand",
    "second": "book",
    "term": "brand book",
    "category": "Brand",
    "definition": "Guide documenting how to use a brand"
  },
  {
    "rank": 191,
    "difficulty": "easy",
    "first": "grid",
    "second": "view",
    "term": "grid view",
    "category": "UI",
    "definition": "Content shown as tiles in rows and columns"
  },
  {
    "rank": 192,
    "difficulty": "easy",
    "first": "front",
    "second": "end",
    "term": "frontend",
    "category": "Workflow",
    "definition": "Part of a product users see and interact with"
  },
  {
    "rank": 193,
    "difficulty": "easy",
    "first": "line",
    "second": "art",
    "term": "line art",
    "category": "Brand",
    "definition": "Illustration made only of lines"
  },
  {
    "rank": 194,
    "difficulty": "easy",
    "first": "text",
    "second": "link",
    "term": "text link",
    "category": "UI",
    "definition": "Clickable words that navigate somewhere"
  },
  {
    "rank": 195,
    "difficulty": "easy",
    "first": "voice",
    "second": "over",
    "term": "voiceover",
    "category": "AI",
    "definition": "Narration recorded or generated over visuals"
  },
  {
    "rank": 196,
    "difficulty": "easy",
    "first": "action",
    "second": "bar",
    "term": "action bar",
    "category": "UI",
    "definition": "Bar holding the main actions for a screen"
  },
  {
    "rank": 197,
    "difficulty": "easy",
    "first": "title",
    "second": "bar",
    "term": "title bar",
    "category": "UI",
    "definition": "Top bar of a window showing its name"
  },
  {
    "rank": 198,
    "difficulty": "easy",
    "first": "cover",
    "second": "image",
    "term": "cover image",
    "category": "UI",
    "definition": "Wide banner image at the top of a profile"
  },
  {
    "rank": 199,
    "difficulty": "easy",
    "first": "sanity",
    "second": "check",
    "term": "sanity check",
    "category": "Workflow",
    "definition": "Quick review to catch obvious mistakes"
  },
  {
    "rank": 200,
    "difficulty": "easy",
    "first": "user",
    "second": "story",
    "term": "user story",
    "category": "UX",
    "definition": "Short statement of a feature from a user's view"
  },
  {
    "rank": 201,
    "difficulty": "easy",
    "first": "address",
    "second": "bar",
    "term": "address bar",
    "category": "UI",
    "definition": "Browser field showing the page's URL"
  },
  {
    "rank": 202,
    "difficulty": "easy",
    "first": "check",
    "second": "list",
    "term": "checklist",
    "category": "Workflow",
    "definition": "List of items to verify or complete"
  },
  {
    "rank": 203,
    "difficulty": "easy",
    "first": "status",
    "second": "bar",
    "term": "status bar",
    "category": "UI",
    "definition": "Top system strip showing time, battery, and signal"
  },
  {
    "rank": 204,
    "difficulty": "easy",
    "first": "app",
    "second": "bar",
    "term": "app bar",
    "category": "UI",
    "definition": "Top bar with an app's title and actions"
  },
  {
    "rank": 205,
    "difficulty": "easy",
    "first": "dead",
    "second": "space",
    "term": "dead space",
    "category": "Layout",
    "definition": "Empty area that serves no purpose"
  },
  {
    "rank": 206,
    "difficulty": "easy",
    "first": "red",
    "second": "line",
    "term": "redline",
    "category": "Workflow",
    "definition": "Annotated spec showing measurements for developers"
  },
  {
    "rank": 207,
    "difficulty": "easy",
    "first": "hero",
    "second": "image",
    "term": "hero image",
    "category": "UI",
    "definition": "Large banner image at the top of a page"
  },
  {
    "rank": 208,
    "difficulty": "easy",
    "first": "sweet",
    "second": "spot",
    "term": "sweet spot",
    "category": "Workflow",
    "definition": "Ideal balance between competing needs"
  },
  {
    "rank": 209,
    "difficulty": "easy",
    "first": "break",
    "second": "point",
    "term": "breakpoint",
    "category": "UI",
    "definition": "Screen width where a layout changes"
  },
  {
    "rank": 210,
    "difficulty": "easy",
    "first": "breathing",
    "second": "room",
    "term": "breathing room",
    "category": "Layout",
    "definition": "Enough space so elements don't feel cramped"
  },
  {
    "rank": 211,
    "difficulty": "easy",
    "first": "field",
    "second": "study",
    "term": "field study",
    "category": "UX",
    "definition": "Research done in the user's real environment"
  },
  {
    "rank": 212,
    "difficulty": "easy",
    "first": "product",
    "second": "design",
    "term": "product design",
    "category": "Workflow",
    "definition": "Designing digital products end to end"
  },
  {
    "rank": 213,
    "difficulty": "easy",
    "first": "focal",
    "second": "point",
    "term": "focal point",
    "category": "Layout",
    "definition": "Where the viewer's eye is drawn first"
  },
  {
    "rank": 214,
    "difficulty": "easy",
    "first": "negative",
    "second": "space",
    "term": "negative space",
    "category": "Layout",
    "definition": "Empty area around a subject that forms shapes"
  },
  {
    "rank": 215,
    "difficulty": "easy",
    "first": "design",
    "second": "review",
    "term": "design review",
    "category": "Workflow",
    "definition": "Meeting where work is critiqued against goals"
  },
  {
    "rank": 216,
    "difficulty": "easy",
    "first": "training",
    "second": "data",
    "term": "training data",
    "category": "AI",
    "definition": "Examples a model learns from"
  },
  {
    "rank": 217,
    "difficulty": "easy",
    "first": "web",
    "second": "app",
    "term": "web app",
    "category": "UI",
    "definition": "Application that runs in a browser"
  },
  {
    "rank": 218,
    "difficulty": "easy",
    "first": "flat",
    "second": "design",
    "term": "flat design",
    "category": "UI",
    "definition": "Style using simple shapes without realistic depth"
  },
  {
    "rank": 219,
    "difficulty": "easy",
    "first": "native",
    "second": "app",
    "term": "native app",
    "category": "UI",
    "definition": "App built specifically for one platform"
  },
  {
    "rank": 220,
    "difficulty": "easy",
    "first": "menu",
    "second": "bar",
    "term": "menu bar",
    "category": "UI",
    "definition": "Horizontal bar of menus at the top of an app"
  },
  {
    "rank": 221,
    "difficulty": "easy",
    "first": "anchor",
    "second": "link",
    "term": "anchor link",
    "category": "UI",
    "definition": "Link that jumps to a section on the same page"
  },
  {
    "rank": 222,
    "difficulty": "easy",
    "first": "tab",
    "second": "order",
    "term": "tab order",
    "category": "UX",
    "definition": "Sequence in which elements receive keyboard focus"
  },
  {
    "rank": 223,
    "difficulty": "easy",
    "first": "north",
    "second": "star",
    "term": "north star",
    "category": "UX",
    "definition": "Guiding vision or metric a team aims for"
  },
  {
    "rank": 224,
    "difficulty": "easy",
    "first": "layer",
    "second": "group",
    "term": "layer group",
    "category": "Tools",
    "definition": "Folder organizing several layers together"
  },
  {
    "rank": 225,
    "difficulty": "easy",
    "first": "combo",
    "second": "box",
    "term": "combo box",
    "category": "UI",
    "definition": "Input combining a text field with a dropdown"
  },
  {
    "rank": 226,
    "difficulty": "easy",
    "first": "color",
    "second": "space",
    "term": "color space",
    "category": "Color",
    "definition": "Range of colors a system can represent"
  },
  {
    "rank": 227,
    "difficulty": "easy",
    "first": "work",
    "second": "shop",
    "term": "workshop",
    "category": "Workflow",
    "definition": "Collaborative session to explore problems and generate ideas"
  },
  {
    "rank": 228,
    "difficulty": "easy",
    "first": "tab",
    "second": "bar",
    "term": "tab bar",
    "category": "UI",
    "definition": "Row of tabs for switching between main sections"
  },
  {
    "rank": 229,
    "difficulty": "easy",
    "first": "white",
    "second": "board",
    "term": "whiteboard",
    "category": "Workflow",
    "definition": "Shared surface for sketching ideas together"
  },
  {
    "rank": 230,
    "difficulty": "easy",
    "first": "blue",
    "second": "sky",
    "term": "blue sky",
    "category": "Workflow",
    "definition": "Unconstrained thinking without practical limits"
  },
  {
    "rank": 231,
    "difficulty": "easy",
    "first": "dialog",
    "second": "box",
    "term": "dialog box",
    "category": "UI",
    "definition": "Small window asking the user for a decision"
  },
  {
    "rank": 232,
    "difficulty": "easy",
    "first": "guide",
    "second": "line",
    "term": "guideline",
    "category": "Layout",
    "definition": "Rule or visual guide keeping designs consistent"
  },
  {
    "rank": 233,
    "difficulty": "easy",
    "first": "design",
    "second": "debt",
    "term": "design debt",
    "category": "Workflow",
    "definition": "Accumulated inconsistencies from shortcuts in past design work"
  },
  {
    "rank": 234,
    "difficulty": "easy",
    "first": "grid",
    "second": "system",
    "term": "grid system",
    "category": "Layout",
    "definition": "Columns and gutters structuring a layout"
  },
  {
    "rank": 235,
    "difficulty": "easy",
    "first": "brand",
    "second": "voice",
    "term": "brand voice",
    "category": "Brand",
    "definition": "Consistent personality in a brand's writing"
  },
  {
    "rank": 236,
    "difficulty": "easy",
    "first": "anchor",
    "second": "point",
    "term": "anchor point",
    "category": "Tools",
    "definition": "Point on a vector path that controls its shape"
  },
  {
    "rank": 237,
    "difficulty": "easy",
    "first": "title",
    "second": "case",
    "term": "title case",
    "category": "Typography",
    "definition": "Capitalizing the main words of a title"
  },
  {
    "rank": 238,
    "difficulty": "easy",
    "first": "side",
    "second": "project",
    "term": "side project",
    "category": "Workflow",
    "definition": "Personal project done outside regular client work"
  },
  {
    "rank": 239,
    "difficulty": "easy",
    "first": "mental",
    "second": "model",
    "term": "mental model",
    "category": "UX",
    "definition": "A user's belief about how something works"
  },
  {
    "rank": 240,
    "difficulty": "easy",
    "first": "tag",
    "second": "line",
    "term": "tagline",
    "category": "Brand",
    "definition": "Short memorable phrase expressing a brand"
  },
  {
    "rank": 241,
    "difficulty": "easy",
    "first": "api",
    "second": "call",
    "term": "API call",
    "category": "AI",
    "definition": "Single request sent to a service"
  },
  {
    "rank": 242,
    "difficulty": "easy",
    "first": "portfolio",
    "second": "review",
    "term": "portfolio review",
    "category": "Workflow",
    "definition": "Critique of a designer's collected work"
  },
  {
    "rank": 243,
    "difficulty": "easy",
    "first": "peer",
    "second": "review",
    "term": "peer review",
    "category": "Workflow",
    "definition": "Feedback from fellow designers on your work"
  },
  {
    "rank": 244,
    "difficulty": "easy",
    "first": "no",
    "second": "code",
    "term": "no-code",
    "category": "AI",
    "definition": "Building products without writing code"
  },
  {
    "rank": 245,
    "difficulty": "easy",
    "first": "out",
    "second": "line",
    "term": "outline",
    "category": "Tools",
    "definition": "Stroke tracing the edge of a shape or text"
  },
  {
    "rank": 246,
    "difficulty": "easy",
    "first": "language",
    "second": "model",
    "term": "language model",
    "category": "AI",
    "definition": "AI trained to understand and generate text"
  },
  {
    "rank": 247,
    "difficulty": "easy",
    "first": "sprint",
    "second": "review",
    "term": "sprint review",
    "category": "Workflow",
    "definition": "Meeting showing work completed in a sprint"
  },
  {
    "rank": 248,
    "difficulty": "easy",
    "first": "low",
    "second": "code",
    "term": "low-code",
    "category": "AI",
    "definition": "Building with minimal hand-written code"
  },
  {
    "rank": 249,
    "difficulty": "easy",
    "first": "big",
    "second": "picture",
    "term": "big picture",
    "category": "Workflow",
    "definition": "The overall goal beyond the details"
  },
  {
    "rank": 250,
    "difficulty": "easy",
    "first": "responsive",
    "second": "design",
    "term": "responsive design",
    "category": "UI",
    "definition": "Layouts that adapt to different screen sizes"
  },
  {
    "rank": 251,
    "difficulty": "easy",
    "first": "user",
    "second": "goal",
    "term": "user goal",
    "category": "UX",
    "definition": "What a user wants to achieve"
  },
  {
    "rank": 252,
    "difficulty": "easy",
    "first": "sentence",
    "second": "case",
    "term": "sentence case",
    "category": "Typography",
    "definition": "Capitalizing only the first word and names"
  },
  {
    "rank": 253,
    "difficulty": "easy",
    "first": "side",
    "second": "panel",
    "term": "side panel",
    "category": "UI",
    "definition": "Secondary area beside content showing extra options"
  },
  {
    "rank": 254,
    "difficulty": "easy",
    "first": "conversion",
    "second": "rate",
    "term": "conversion rate",
    "category": "UX",
    "definition": "Share of users completing a desired action"
  },
  {
    "rank": 255,
    "difficulty": "easy",
    "first": "data",
    "second": "set",
    "term": "dataset",
    "category": "AI",
    "definition": "Structured collection of data"
  },
  {
    "rank": 256,
    "difficulty": "easy",
    "first": "zoom",
    "second": "level",
    "term": "zoom level",
    "category": "Tools",
    "definition": "Current magnification of the canvas"
  },
  {
    "rank": 257,
    "difficulty": "easy",
    "first": "knowledge",
    "second": "base",
    "term": "knowledge base",
    "category": "AI",
    "definition": "Collection of documents an AI can draw from"
  },
  {
    "rank": 258,
    "difficulty": "moderate",
    "first": "foundation",
    "second": "model",
    "term": "foundation model",
    "category": "AI",
    "definition": "Large general model adapted for many tasks"
  },
  {
    "rank": 259,
    "difficulty": "moderate",
    "first": "synthetic",
    "second": "data",
    "term": "synthetic data",
    "category": "AI",
    "definition": "Artificially generated data used for training or testing"
  },
  {
    "rank": 260,
    "difficulty": "moderate",
    "first": "letter",
    "second": "head",
    "term": "letterhead",
    "category": "Brand",
    "definition": "Printed heading on official stationery"
  },
  {
    "rank": 261,
    "difficulty": "moderate",
    "first": "vision",
    "second": "model",
    "term": "vision model",
    "category": "AI",
    "definition": "AI that understands images"
  },
  {
    "rank": 262,
    "difficulty": "moderate",
    "first": "synthetic",
    "second": "media",
    "term": "synthetic media",
    "category": "AI",
    "definition": "Images, video, or audio created by AI"
  },
  {
    "rank": 263,
    "difficulty": "moderate",
    "first": "design",
    "second": "brief",
    "term": "design brief",
    "category": "Workflow",
    "definition": "Document outlining a project's goals, audience, and scope"
  },
  {
    "rank": 264,
    "difficulty": "moderate",
    "first": "rabbit",
    "second": "hole",
    "term": "rabbit hole",
    "category": "Workflow",
    "definition": "Getting lost exploring one small detail"
  },
  {
    "rank": 265,
    "difficulty": "moderate",
    "first": "touch",
    "second": "target",
    "term": "touch target",
    "category": "UI",
    "definition": "Tappable area of an element on a touchscreen"
  },
  {
    "rank": 266,
    "difficulty": "moderate",
    "first": "bounce",
    "second": "rate",
    "term": "bounce rate",
    "category": "UX",
    "definition": "Share of visitors leaving after one page"
  },
  {
    "rank": 267,
    "difficulty": "moderate",
    "first": "custom",
    "second": "model",
    "term": "custom model",
    "category": "AI",
    "definition": "AI model trained on your own data or style"
  },
  {
    "rank": 268,
    "difficulty": "moderate",
    "first": "trade",
    "second": "mark",
    "term": "trademark",
    "category": "Brand",
    "definition": "Legally protected brand name or symbol"
  },
  {
    "rank": 269,
    "difficulty": "moderate",
    "first": "service",
    "second": "design",
    "term": "service design",
    "category": "UX",
    "definition": "Designing whole services across people and touchpoints"
  },
  {
    "rank": 270,
    "difficulty": "moderate",
    "first": "file",
    "second": "size",
    "term": "file size",
    "category": "Tools",
    "definition": "How much storage a file uses"
  },
  {
    "rank": 271,
    "difficulty": "moderate",
    "first": "creative",
    "second": "brief",
    "term": "creative brief",
    "category": "Workflow",
    "definition": "Summary guiding the creative direction of a campaign"
  },
  {
    "rank": 272,
    "difficulty": "moderate",
    "first": "token",
    "second": "cost",
    "term": "token cost",
    "category": "AI",
    "definition": "Price charged per chunk of text processed"
  },
  {
    "rank": 273,
    "difficulty": "moderate",
    "first": "sub",
    "second": "brand",
    "term": "sub-brand",
    "category": "Brand",
    "definition": "Brand that lives under a parent brand"
  },
  {
    "rank": 274,
    "difficulty": "moderate",
    "first": "human",
    "second": "touch",
    "term": "human touch",
    "category": "AI",
    "definition": "Personal craft AI can't fully replace"
  },
  {
    "rank": 275,
    "difficulty": "moderate",
    "first": "skip",
    "second": "link",
    "term": "skip link",
    "category": "UX",
    "definition": "Hidden link letting keyboard users jump to content"
  },
  {
    "rank": 276,
    "difficulty": "moderate",
    "first": "secondary",
    "second": "color",
    "term": "secondary color",
    "category": "Color",
    "definition": "Supporting color used alongside the primary"
  },
  {
    "rank": 277,
    "difficulty": "moderate",
    "first": "reasoning",
    "second": "model",
    "term": "reasoning model",
    "category": "AI",
    "definition": "AI that thinks through steps before answering"
  },
  {
    "rank": 278,
    "difficulty": "moderate",
    "first": "side",
    "second": "sheet",
    "term": "side sheet",
    "category": "UI",
    "definition": "Panel that slides in from the screen's side"
  },
  {
    "rank": 279,
    "difficulty": "moderate",
    "first": "layer",
    "second": "style",
    "term": "layer style",
    "category": "Tools",
    "definition": "Effects like shadows applied to a whole layer"
  },
  {
    "rank": 280,
    "difficulty": "moderate",
    "first": "frontier",
    "second": "model",
    "term": "frontier model",
    "category": "AI",
    "definition": "Most advanced AI model available at a time"
  },
  {
    "rank": 281,
    "difficulty": "moderate",
    "first": "ghost",
    "second": "text",
    "term": "ghost text",
    "category": "AI",
    "definition": "Faint suggested text you can accept with a key"
  },
  {
    "rank": 282,
    "difficulty": "moderate",
    "first": "over",
    "second": "flow",
    "term": "overflow",
    "category": "UI",
    "definition": "Content that exceeds its container's bounds"
  },
  {
    "rank": 283,
    "difficulty": "moderate",
    "first": "action",
    "second": "sheet",
    "term": "action sheet",
    "category": "UI",
    "definition": "Bottom menu presenting choices for the current task"
  },
  {
    "rank": 284,
    "difficulty": "moderate",
    "first": "reference",
    "second": "image",
    "term": "reference image",
    "category": "AI",
    "definition": "Picture uploaded to steer AI output"
  },
  {
    "rank": 285,
    "difficulty": "moderate",
    "first": "drag",
    "second": "handle",
    "term": "drag handle",
    "category": "UI",
    "definition": "Grip icon showing an item can be moved"
  },
  {
    "rank": 286,
    "difficulty": "moderate",
    "first": "focus",
    "second": "ring",
    "term": "focus ring",
    "category": "UX",
    "definition": "Outline showing which element has keyboard focus"
  },
  {
    "rank": 287,
    "difficulty": "moderate",
    "first": "open",
    "second": "source",
    "term": "open source",
    "category": "AI",
    "definition": "Freely available code anyone can use and modify"
  },
  {
    "rank": 288,
    "difficulty": "moderate",
    "first": "batch",
    "second": "size",
    "term": "batch size",
    "category": "AI",
    "definition": "Number of outputs generated at once"
  },
  {
    "rank": 289,
    "difficulty": "moderate",
    "first": "light",
    "second": "box",
    "term": "lightbox",
    "category": "UI",
    "definition": "Overlay that shows an enlarged image over dimmed content"
  },
  {
    "rank": 290,
    "difficulty": "moderate",
    "first": "bottom",
    "second": "sheet",
    "term": "bottom sheet",
    "category": "UI",
    "definition": "Panel that slides up from the screen's bottom"
  },
  {
    "rank": 291,
    "difficulty": "moderate",
    "first": "frame",
    "second": "rate",
    "term": "frame rate",
    "category": "Motion",
    "definition": "Number of frames shown per second"
  },
  {
    "rank": 292,
    "difficulty": "moderate",
    "first": "line",
    "second": "break",
    "term": "line break",
    "category": "Typography",
    "definition": "Point where text moves to a new line"
  },
  {
    "rank": 293,
    "difficulty": "moderate",
    "first": "check",
    "second": "mark",
    "term": "checkmark",
    "category": "UI",
    "definition": "Tick symbol showing success or selection"
  },
  {
    "rank": 294,
    "difficulty": "moderate",
    "first": "mind",
    "second": "map",
    "term": "mind map",
    "category": "UX",
    "definition": "Diagram branching ideas out from a central topic"
  },
  {
    "rank": 295,
    "difficulty": "moderate",
    "first": "back",
    "second": "drop",
    "term": "backdrop",
    "category": "Layout",
    "definition": "Background surface behind an element or modal"
  },
  {
    "rank": 296,
    "difficulty": "moderate",
    "first": "story",
    "second": "map",
    "term": "story map",
    "category": "UX",
    "definition": "User stories arranged along the user journey"
  },
  {
    "rank": 297,
    "difficulty": "moderate",
    "first": "hero",
    "second": "section",
    "term": "hero section",
    "category": "UI",
    "definition": "Prominent top section of a page"
  },
  {
    "rank": 298,
    "difficulty": "moderate",
    "first": "experience",
    "second": "map",
    "term": "experience map",
    "category": "UX",
    "definition": "Visualization of a general human experience over time"
  },
  {
    "rank": 299,
    "difficulty": "moderate",
    "first": "alt",
    "second": "text",
    "term": "alt text",
    "category": "UX",
    "definition": "Written description of an image for screen readers"
  },
  {
    "rank": 300,
    "difficulty": "moderate",
    "first": "splash",
    "second": "screen",
    "term": "splash screen",
    "category": "UI",
    "definition": "Screen shown briefly while an app launches"
  },
  {
    "rank": 301,
    "difficulty": "moderate",
    "first": "bench",
    "second": "mark",
    "term": "benchmark",
    "category": "UX",
    "definition": "Standard used to measure and compare performance"
  },
  {
    "rank": 302,
    "difficulty": "moderate",
    "first": "skeleton",
    "second": "screen",
    "term": "skeleton screen",
    "category": "UI",
    "definition": "Grey outline of layout shown while content loads"
  },
  {
    "rank": 303,
    "difficulty": "moderate",
    "first": "work",
    "second": "load",
    "term": "workload",
    "category": "Workflow",
    "definition": "Amount of work assigned to someone"
  },
  {
    "rank": 304,
    "difficulty": "moderate",
    "first": "api",
    "second": "key",
    "term": "API key",
    "category": "AI",
    "definition": "Secret code that authorizes access to an AI service"
  },
  {
    "rank": 305,
    "difficulty": "moderate",
    "first": "over",
    "second": "lay",
    "term": "overlay",
    "category": "UI",
    "definition": "Layer placed above content, often semi-transparent"
  },
  {
    "rank": 306,
    "difficulty": "moderate",
    "first": "happy",
    "second": "path",
    "term": "happy path",
    "category": "UX",
    "definition": "The ideal flow where nothing goes wrong"
  },
  {
    "rank": 307,
    "difficulty": "moderate",
    "first": "base",
    "second": "line",
    "term": "baseline",
    "category": "Typography",
    "definition": "Invisible line that letters sit on"
  },
  {
    "rank": 308,
    "difficulty": "moderate",
    "first": "visual",
    "second": "weight",
    "term": "visual weight",
    "category": "Layout",
    "definition": "How strongly an element attracts attention"
  },
  {
    "rank": 309,
    "difficulty": "moderate",
    "first": "usability",
    "second": "test",
    "term": "usability test",
    "category": "UX",
    "definition": "Session observing users completing tasks with a design"
  },
  {
    "rank": 310,
    "difficulty": "moderate",
    "first": "interaction",
    "second": "design",
    "term": "interaction design",
    "category": "UX",
    "definition": "Designing how users and products respond to each other"
  },
  {
    "rank": 311,
    "difficulty": "moderate",
    "first": "journey",
    "second": "map",
    "term": "journey map",
    "category": "UX",
    "definition": "Visual of a user's steps and emotions over time"
  },
  {
    "rank": 312,
    "difficulty": "moderate",
    "first": "back",
    "second": "button",
    "term": "back button",
    "category": "UI",
    "definition": "Control that returns to the previous screen"
  },
  {
    "rank": 313,
    "difficulty": "moderate",
    "first": "banner",
    "second": "ad",
    "term": "banner ad",
    "category": "Brand",
    "definition": "Rectangular advertisement placed on a web page"
  },
  {
    "rank": 314,
    "difficulty": "moderate",
    "first": "hex",
    "second": "code",
    "term": "hex code",
    "category": "Color",
    "definition": "Six-character code defining a color, like #FF5733"
  },
  {
    "rank": 315,
    "difficulty": "moderate",
    "first": "churn",
    "second": "rate",
    "term": "churn rate",
    "category": "UX",
    "definition": "Share of users who stop using a product"
  },
  {
    "rank": 316,
    "difficulty": "moderate",
    "first": "confidence",
    "second": "score",
    "term": "confidence score",
    "category": "AI",
    "definition": "How certain a model is about its output"
  },
  {
    "rank": 317,
    "difficulty": "moderate",
    "first": "short",
    "second": "cut",
    "term": "shortcut",
    "category": "Tools",
    "definition": "Key combination that triggers a command quickly"
  },
  {
    "rank": 318,
    "difficulty": "moderate",
    "first": "touch",
    "second": "point",
    "term": "touchpoint",
    "category": "UX",
    "definition": "Any moment a user interacts with a brand"
  },
  {
    "rank": 319,
    "difficulty": "moderate",
    "first": "dynamic",
    "second": "type",
    "term": "dynamic type",
    "category": "Typography",
    "definition": "Text that scales with the user's size setting"
  },
  {
    "rank": 320,
    "difficulty": "moderate",
    "first": "eye",
    "second": "candy",
    "term": "eye candy",
    "category": "Workflow",
    "definition": "Visually attractive but not necessarily useful"
  },
  {
    "rank": 321,
    "difficulty": "moderate",
    "first": "character",
    "second": "style",
    "term": "character style",
    "category": "Typography",
    "definition": "Saved formatting applied to selected words"
  },
  {
    "rank": 322,
    "difficulty": "moderate",
    "first": "diffusion",
    "second": "model",
    "term": "diffusion model",
    "category": "AI",
    "definition": "AI that creates images by removing noise step by step"
  },
  {
    "rank": 323,
    "difficulty": "moderate",
    "first": "text",
    "second": "style",
    "term": "text style",
    "category": "Typography",
    "definition": "Saved set of font, size, and spacing settings"
  },
  {
    "rank": 324,
    "difficulty": "moderate",
    "first": "water",
    "second": "mark",
    "term": "watermark",
    "category": "Brand",
    "definition": "Faint mark over an image showing ownership"
  },
  {
    "rank": 325,
    "difficulty": "moderate",
    "first": "double",
    "second": "tap",
    "term": "double tap",
    "category": "UI",
    "definition": "Tapping twice quickly to trigger an action"
  },
  {
    "rank": 326,
    "difficulty": "moderate",
    "first": "split",
    "second": "button",
    "term": "split button",
    "category": "UI",
    "definition": "Button with a main action plus a dropdown"
  },
  {
    "rank": 327,
    "difficulty": "moderate",
    "first": "context",
    "second": "menu",
    "term": "context menu",
    "category": "UI",
    "definition": "Menu of actions shown on right-click or long-press"
  },
  {
    "rank": 328,
    "difficulty": "moderate",
    "first": "task",
    "second": "flow",
    "term": "task flow",
    "category": "UX",
    "definition": "Steps needed to complete one specific task"
  },
  {
    "rank": 329,
    "difficulty": "moderate",
    "first": "feedback",
    "second": "loop",
    "term": "feedback loop",
    "category": "Workflow",
    "definition": "Cycle of sharing, learning, and improving"
  },
  {
    "rank": 330,
    "difficulty": "moderate",
    "first": "prompt",
    "second": "bar",
    "term": "prompt bar",
    "category": "AI",
    "definition": "Input area where users type requests to AI"
  },
  {
    "rank": 331,
    "difficulty": "moderate",
    "first": "jail",
    "second": "break",
    "term": "jailbreak",
    "category": "AI",
    "definition": "Trick to bypass an AI's safety rules"
  },
  {
    "rank": 332,
    "difficulty": "moderate",
    "first": "sound",
    "second": "design",
    "term": "sound design",
    "category": "Motion",
    "definition": "Creating audio cues and effects for products"
  },
  {
    "rank": 333,
    "difficulty": "moderate",
    "first": "free",
    "second": "hand",
    "term": "freehand",
    "category": "Tools",
    "definition": "Drawn by hand without guides or constraints"
  },
  {
    "rank": 334,
    "difficulty": "moderate",
    "first": "color",
    "second": "mode",
    "term": "color mode",
    "category": "Color",
    "definition": "Color model like RGB or CMYK"
  },
  {
    "rank": 335,
    "difficulty": "moderate",
    "first": "body",
    "second": "text",
    "term": "body text",
    "category": "Typography",
    "definition": "Main running text of a document"
  },
  {
    "rank": 336,
    "difficulty": "moderate",
    "first": "rate",
    "second": "limit",
    "term": "rate limit",
    "category": "AI",
    "definition": "Cap on how many requests you can make"
  },
  {
    "rank": 337,
    "difficulty": "moderate",
    "first": "version",
    "second": "history",
    "term": "version history",
    "category": "Tools",
    "definition": "Record of saved file states you can restore"
  },
  {
    "rank": 338,
    "difficulty": "moderate",
    "first": "ghost",
    "second": "button",
    "term": "ghost button",
    "category": "UI",
    "definition": "Transparent button with only an outline"
  },
  {
    "rank": 339,
    "difficulty": "moderate",
    "first": "depth",
    "second": "map",
    "term": "depth map",
    "category": "AI",
    "definition": "Grayscale image showing distance from camera"
  },
  {
    "rank": 340,
    "difficulty": "moderate",
    "first": "spacing",
    "second": "scale",
    "term": "spacing scale",
    "category": "Layout",
    "definition": "Set of consistent spacing values"
  },
  {
    "rank": 341,
    "difficulty": "moderate",
    "first": "scroll",
    "second": "bar",
    "term": "scrollbar",
    "category": "UI",
    "definition": "Control showing and changing scroll position"
  },
  {
    "rank": 342,
    "difficulty": "moderate",
    "first": "line",
    "second": "weight",
    "term": "line weight",
    "category": "Tools",
    "definition": "Thickness of a drawn line"
  },
  {
    "rank": 343,
    "difficulty": "moderate",
    "first": "touch",
    "second": "screen",
    "term": "touchscreen",
    "category": "UI",
    "definition": "Display that responds to finger input"
  },
  {
    "rank": 344,
    "difficulty": "moderate",
    "first": "split",
    "second": "screen",
    "term": "split screen",
    "category": "Layout",
    "definition": "Layout dividing the view into two panes"
  },
  {
    "rank": 345,
    "difficulty": "moderate",
    "first": "page",
    "second": "break",
    "term": "page break",
    "category": "Print",
    "definition": "Point where content moves to a new page"
  },
  {
    "rank": 346,
    "difficulty": "moderate",
    "first": "design",
    "second": "file",
    "term": "design file",
    "category": "Tools",
    "definition": "Working document containing a project's designs"
  },
  {
    "rank": 347,
    "difficulty": "moderate",
    "first": "source",
    "second": "file",
    "term": "source file",
    "category": "Tools",
    "definition": "Original editable file a design was made in"
  },
  {
    "rank": 348,
    "difficulty": "moderate",
    "first": "visual",
    "second": "noise",
    "term": "visual noise",
    "category": "Layout",
    "definition": "Clutter that distracts from key content"
  },
  {
    "rank": 349,
    "difficulty": "moderate",
    "first": "mega",
    "second": "menu",
    "term": "mega menu",
    "category": "UI",
    "definition": "Large dropdown showing many navigation options at once"
  },
  {
    "rank": 350,
    "difficulty": "moderate",
    "first": "hair",
    "second": "line",
    "term": "hairline",
    "category": "Typography",
    "definition": "The thinnest stroke or weight in a design"
  },
  {
    "rank": 351,
    "difficulty": "moderate",
    "first": "color",
    "second": "theory",
    "term": "color theory",
    "category": "Color",
    "definition": "Principles of how colors mix and interact"
  },
  {
    "rank": 352,
    "difficulty": "moderate",
    "first": "logo",
    "second": "type",
    "term": "logotype",
    "category": "Brand",
    "definition": "Logo made from stylized text of the name"
  },
  {
    "rank": 353,
    "difficulty": "moderate",
    "first": "icon",
    "second": "button",
    "term": "icon button",
    "category": "UI",
    "definition": "Button showing only an icon, no text"
  },
  {
    "rank": 354,
    "difficulty": "moderate",
    "first": "working",
    "second": "session",
    "term": "working session",
    "category": "Workflow",
    "definition": "Meeting where the team designs together live"
  },
  {
    "rank": 355,
    "difficulty": "moderate",
    "first": "line",
    "second": "chart",
    "term": "line chart",
    "category": "Layout",
    "definition": "Chart showing change over time with connected points"
  },
  {
    "rank": 356,
    "difficulty": "moderate",
    "first": "smart",
    "second": "guide",
    "term": "smart guide",
    "category": "Tools",
    "definition": "Temporary guide helping snap and align objects"
  },
  {
    "rank": 357,
    "difficulty": "moderate",
    "first": "line",
    "second": "icon",
    "term": "line icon",
    "category": "UI",
    "definition": "Icon drawn with outlines, not solid fills"
  },
  {
    "rank": 358,
    "difficulty": "moderate",
    "first": "vibe",
    "second": "design",
    "term": "vibe design",
    "category": "AI",
    "definition": "Designing by describing the feel to AI"
  },
  {
    "rank": 359,
    "difficulty": "moderate",
    "first": "box",
    "second": "shadow",
    "term": "box shadow",
    "category": "UI",
    "definition": "CSS shadow applied around an element's box"
  },
  {
    "rank": 360,
    "difficulty": "moderate",
    "first": "back",
    "second": "cover",
    "term": "back cover",
    "category": "Print",
    "definition": "Outer rear side of a book or brochure"
  },
  {
    "rank": 361,
    "difficulty": "moderate",
    "first": "modal",
    "second": "window",
    "term": "modal window",
    "category": "UI",
    "definition": "Dialog that blocks the page until dismissed"
  },
  {
    "rank": 362,
    "difficulty": "moderate",
    "first": "under",
    "second": "line",
    "term": "underline",
    "category": "Typography",
    "definition": "Line drawn beneath text, often for links"
  },
  {
    "rank": 363,
    "difficulty": "moderate",
    "first": "free",
    "second": "form",
    "term": "freeform",
    "category": "Tools",
    "definition": "Loose, organic shapes not bound to a grid"
  },
  {
    "rank": 364,
    "difficulty": "moderate",
    "first": "motion",
    "second": "design",
    "term": "motion design",
    "category": "Motion",
    "definition": "Designing movement and animation for interfaces or media"
  },
  {
    "rank": 365,
    "difficulty": "moderate",
    "first": "view",
    "second": "port",
    "term": "viewport",
    "category": "UI",
    "definition": "Visible area of a web page on screen"
  },
  {
    "rank": 366,
    "difficulty": "moderate",
    "first": "empathy",
    "second": "map",
    "term": "empathy map",
    "category": "UX",
    "definition": "Chart capturing what users say, think, do, and feel"
  },
  {
    "rank": 367,
    "difficulty": "moderate",
    "first": "cover",
    "second": "page",
    "term": "cover page",
    "category": "Print",
    "definition": "Front page introducing a document"
  },
  {
    "rank": 368,
    "difficulty": "moderate",
    "first": "white",
    "second": "label",
    "term": "white label",
    "category": "Brand",
    "definition": "Product rebranded and sold under another company's name"
  },
  {
    "rank": 369,
    "difficulty": "moderate",
    "first": "snack",
    "second": "bar",
    "term": "snackbar",
    "category": "UI",
    "definition": "Brief message appearing at the bottom of screen"
  },
  {
    "rank": 370,
    "difficulty": "moderate",
    "first": "agent",
    "second": "mode",
    "term": "agent mode",
    "category": "AI",
    "definition": "Setting where AI works through tasks on its own"
  },
  {
    "rank": 371,
    "difficulty": "moderate",
    "first": "sand",
    "second": "box",
    "term": "sandbox",
    "category": "AI",
    "definition": "Safe, isolated space for experimenting"
  },
  {
    "rank": 372,
    "difficulty": "moderate",
    "first": "inner",
    "second": "shadow",
    "term": "inner shadow",
    "category": "UI",
    "definition": "Shadow inside an element's edges, looking pressed in"
  },
  {
    "rank": 373,
    "difficulty": "moderate",
    "first": "icon",
    "second": "grid",
    "term": "icon grid",
    "category": "UI",
    "definition": "Template of shapes keeping icons visually consistent"
  },
  {
    "rank": 374,
    "difficulty": "moderate",
    "first": "front",
    "second": "cover",
    "term": "front cover",
    "category": "Print",
    "definition": "Outer front side of a book or brochure"
  },
  {
    "rank": 375,
    "difficulty": "moderate",
    "first": "deep",
    "second": "dive",
    "term": "deep dive",
    "category": "Workflow",
    "definition": "Thorough, detailed exploration of a topic"
  },
  {
    "rank": 376,
    "difficulty": "moderate",
    "first": "coding",
    "second": "agent",
    "term": "coding agent",
    "category": "AI",
    "definition": "AI that writes and edits code autonomously"
  },
  {
    "rank": 377,
    "difficulty": "moderate",
    "first": "play",
    "second": "ground",
    "term": "playground",
    "category": "AI",
    "definition": "Interface for testing prompts and model settings"
  },
  {
    "rank": 378,
    "difficulty": "moderate",
    "first": "back",
    "second": "log",
    "term": "backlog",
    "category": "Workflow",
    "definition": "Prioritized list of tasks waiting to be done"
  },
  {
    "rank": 379,
    "difficulty": "moderate",
    "first": "affinity",
    "second": "map",
    "term": "affinity map",
    "category": "UX",
    "definition": "Grouping research notes into themes"
  },
  {
    "rank": 380,
    "difficulty": "moderate",
    "first": "key",
    "second": "message",
    "term": "key message",
    "category": "Brand",
    "definition": "Core idea a communication must deliver"
  },
  {
    "rank": 381,
    "difficulty": "moderate",
    "first": "usage",
    "second": "limit",
    "term": "usage limit",
    "category": "AI",
    "definition": "Cap on how much AI you can use per period"
  },
  {
    "rank": 382,
    "difficulty": "moderate",
    "first": "scroll",
    "second": "snap",
    "term": "scroll snap",
    "category": "UI",
    "definition": "Scrolling that locks neatly onto sections"
  },
  {
    "rank": 383,
    "difficulty": "moderate",
    "first": "paragraph",
    "second": "style",
    "term": "paragraph style",
    "category": "Typography",
    "definition": "Saved formatting applied to whole paragraphs"
  },
  {
    "rank": 384,
    "difficulty": "moderate",
    "first": "brand",
    "second": "kit",
    "term": "brand kit",
    "category": "Brand",
    "definition": "Package of logos, colors, and fonts for a brand"
  },
  {
    "rank": 385,
    "difficulty": "moderate",
    "first": "brain",
    "second": "dump",
    "term": "brain dump",
    "category": "Workflow",
    "definition": "Getting every idea out without filtering"
  },
  {
    "rank": 386,
    "difficulty": "moderate",
    "first": "multimodal",
    "second": "model",
    "term": "multimodal model",
    "category": "AI",
    "definition": "AI handling text, images, audio, or video together"
  },
  {
    "rank": 387,
    "difficulty": "moderate",
    "first": "answer",
    "second": "engine",
    "term": "answer engine",
    "category": "AI",
    "definition": "Search tool that responds with direct answers"
  },
  {
    "rank": 388,
    "difficulty": "moderate",
    "first": "cognitive",
    "second": "load",
    "term": "cognitive load",
    "category": "UX",
    "definition": "Mental effort needed to use an interface"
  },
  {
    "rank": 389,
    "difficulty": "moderate",
    "first": "layout",
    "second": "shift",
    "term": "layout shift",
    "category": "UX",
    "definition": "Unexpected jump of content while a page loads"
  },
  {
    "rank": 390,
    "difficulty": "moderate",
    "first": "cool",
    "second": "gray",
    "term": "cool gray",
    "category": "Color",
    "definition": "Gray with a slight blue tint"
  },
  {
    "rank": 391,
    "difficulty": "moderate",
    "first": "type",
    "second": "set",
    "term": "typeset",
    "category": "Typography",
    "definition": "To arrange text for printing or display"
  },
  {
    "rank": 392,
    "difficulty": "moderate",
    "first": "pay",
    "second": "wall",
    "term": "paywall",
    "category": "UX",
    "definition": "Barrier requiring payment to access content"
  },
  {
    "rank": 393,
    "difficulty": "moderate",
    "first": "synthetic",
    "second": "user",
    "term": "synthetic user",
    "category": "AI",
    "definition": "AI-simulated user used in research"
  },
  {
    "rank": 394,
    "difficulty": "moderate",
    "first": "type",
    "second": "scale",
    "term": "type scale",
    "category": "Typography",
    "definition": "Set of harmonious font sizes used in a design"
  },
  {
    "rank": 395,
    "difficulty": "moderate",
    "first": "design",
    "second": "audit",
    "term": "design audit",
    "category": "Workflow",
    "definition": "Review of a product's design for consistency"
  },
  {
    "rank": 396,
    "difficulty": "moderate",
    "first": "font",
    "second": "style",
    "term": "font style",
    "category": "Typography",
    "definition": "Variant such as italic or regular"
  },
  {
    "rank": 397,
    "difficulty": "moderate",
    "first": "warm",
    "second": "gray",
    "term": "warm gray",
    "category": "Color",
    "definition": "Gray with a slight red or yellow tint"
  },
  {
    "rank": 398,
    "difficulty": "moderate",
    "first": "token",
    "second": "limit",
    "term": "token limit",
    "category": "AI",
    "definition": "Maximum tokens a model can handle"
  },
  {
    "rank": 399,
    "difficulty": "moderate",
    "first": "prompt",
    "second": "weight",
    "term": "prompt weight",
    "category": "AI",
    "definition": "Value giving one part of a prompt more influence"
  },
  {
    "rank": 400,
    "difficulty": "moderate",
    "first": "up",
    "second": "scale",
    "term": "upscale",
    "category": "AI",
    "definition": "Enlarging an image while adding detail"
  },
  {
    "rank": 401,
    "difficulty": "moderate",
    "first": "motion",
    "second": "path",
    "term": "motion path",
    "category": "Motion",
    "definition": "Route an object follows during an animation"
  },
  {
    "rank": 402,
    "difficulty": "moderate",
    "first": "hand",
    "second": "tool",
    "term": "hand tool",
    "category": "Tools",
    "definition": "Tool for panning around the canvas"
  },
  {
    "rank": 403,
    "difficulty": "moderate",
    "first": "model",
    "second": "version",
    "term": "model version",
    "category": "AI",
    "definition": "Specific release of an AI model"
  },
  {
    "rank": 404,
    "difficulty": "moderate",
    "first": "deep",
    "second": "research",
    "term": "deep research",
    "category": "AI",
    "definition": "AI mode that investigates many sources into a report"
  },
  {
    "rank": 405,
    "difficulty": "moderate",
    "first": "type",
    "second": "tool",
    "term": "type tool",
    "category": "Tools",
    "definition": "Tool for adding and editing text"
  },
  {
    "rank": 406,
    "difficulty": "moderate",
    "first": "smart",
    "second": "reply",
    "term": "smart reply",
    "category": "AI",
    "definition": "AI-suggested short responses to messages"
  },
  {
    "rank": 407,
    "difficulty": "moderate",
    "first": "vector",
    "second": "search",
    "term": "vector search",
    "category": "AI",
    "definition": "Finding items by meaning rather than exact words"
  },
  {
    "rank": 408,
    "difficulty": "moderate",
    "first": "accordion",
    "second": "menu",
    "term": "accordion menu",
    "category": "UI",
    "definition": "Stacked sections that expand and collapse"
  },
  {
    "rank": 409,
    "difficulty": "moderate",
    "first": "scroll",
    "second": "depth",
    "term": "scroll depth",
    "category": "UX",
    "definition": "How far down a page users scroll"
  },
  {
    "rank": 410,
    "difficulty": "moderate",
    "first": "vector",
    "second": "path",
    "term": "vector path",
    "category": "Tools",
    "definition": "Line defined by points and curves"
  },
  {
    "rank": 411,
    "difficulty": "moderate",
    "first": "body",
    "second": "copy",
    "term": "body copy",
    "category": "Typography",
    "definition": "Main paragraph text of a piece"
  },
  {
    "rank": 412,
    "difficulty": "moderate",
    "first": "context",
    "second": "window",
    "term": "context window",
    "category": "AI",
    "definition": "Amount of text an AI can consider at once"
  },
  {
    "rank": 413,
    "difficulty": "moderate",
    "first": "bounding",
    "second": "box",
    "term": "bounding box",
    "category": "Tools",
    "definition": "Rectangle surrounding an object for resizing and moving"
  },
  {
    "rank": 414,
    "difficulty": "moderate",
    "first": "shape",
    "second": "tool",
    "term": "shape tool",
    "category": "Tools",
    "definition": "Tool for drawing rectangles, circles, and polygons"
  },
  {
    "rank": 415,
    "difficulty": "moderate",
    "first": "word",
    "second": "mark",
    "term": "wordmark",
    "category": "Brand",
    "definition": "Logo consisting only of the brand name"
  },
  {
    "rank": 416,
    "difficulty": "moderate",
    "first": "selection",
    "second": "tool",
    "term": "selection tool",
    "category": "Tools",
    "definition": "Tool for picking and moving objects"
  },
  {
    "rank": 417,
    "difficulty": "moderate",
    "first": "hot",
    "second": "spot",
    "term": "hotspot",
    "category": "Tools",
    "definition": "Clickable area in a prototype linking to another screen"
  },
  {
    "rank": 418,
    "difficulty": "moderate",
    "first": "paper",
    "second": "stock",
    "term": "paper stock",
    "category": "Print",
    "definition": "Type and weight of paper used for printing"
  },
  {
    "rank": 419,
    "difficulty": "moderate",
    "first": "card",
    "second": "stock",
    "term": "card stock",
    "category": "Print",
    "definition": "Thick, sturdy paper used for cards and covers"
  },
  {
    "rank": 420,
    "difficulty": "moderate",
    "first": "proof",
    "second": "read",
    "term": "proofread",
    "category": "Print",
    "definition": "Checking text carefully for errors before publishing"
  },
  {
    "rank": 421,
    "difficulty": "moderate",
    "first": "notification",
    "second": "badge",
    "term": "notification badge",
    "category": "UI",
    "definition": "Small dot or count showing unread items"
  },
  {
    "rank": 422,
    "difficulty": "moderate",
    "first": "flex",
    "second": "box",
    "term": "flexbox",
    "category": "Layout",
    "definition": "CSS layout model for arranging items in rows or columns"
  },
  {
    "rank": 423,
    "difficulty": "moderate",
    "first": "dummy",
    "second": "text",
    "term": "dummy text",
    "category": "Typography",
    "definition": "Filler text used before real copy exists"
  },
  {
    "rank": 424,
    "difficulty": "moderate",
    "first": "design",
    "second": "language",
    "term": "design language",
    "category": "Brand",
    "definition": "Consistent visual style across a product"
  },
  {
    "rank": 425,
    "difficulty": "moderate",
    "first": "blend",
    "second": "mode",
    "term": "blend mode",
    "category": "Tools",
    "definition": "Rule for how a layer's colors mix with layers below"
  },
  {
    "rank": 426,
    "difficulty": "moderate",
    "first": "grid",
    "second": "line",
    "term": "gridline",
    "category": "Layout",
    "definition": "Guide line forming part of a grid"
  },
  {
    "rank": 427,
    "difficulty": "moderate",
    "first": "spot",
    "second": "color",
    "term": "spot color",
    "category": "Print",
    "definition": "Premixed ink printed as a single exact color"
  },
  {
    "rank": 428,
    "difficulty": "moderate",
    "first": "brush",
    "second": "tool",
    "term": "brush tool",
    "category": "Tools",
    "definition": "Tool for painting strokes"
  },
  {
    "rank": 429,
    "difficulty": "moderate",
    "first": "key",
    "second": "visual",
    "term": "key visual",
    "category": "Brand",
    "definition": "Central image defining a campaign's look"
  },
  {
    "rank": 430,
    "difficulty": "moderate",
    "first": "brand",
    "second": "asset",
    "term": "brand asset",
    "category": "Brand",
    "definition": "Any logo, image, or element owned by a brand"
  },
  {
    "rank": 431,
    "difficulty": "moderate",
    "first": "crop",
    "second": "tool",
    "term": "crop tool",
    "category": "Tools",
    "definition": "Tool for trimming an image's edges"
  },
  {
    "rank": 432,
    "difficulty": "moderate",
    "first": "ai",
    "second": "label",
    "term": "AI label",
    "category": "AI",
    "definition": "Tag marking content as AI-made"
  },
  {
    "rank": 433,
    "difficulty": "moderate",
    "first": "reduced",
    "second": "motion",
    "term": "reduced motion",
    "category": "UX",
    "definition": "Setting that minimizes animation for sensitive users"
  },
  {
    "rank": 434,
    "difficulty": "moderate",
    "first": "semantic",
    "second": "search",
    "term": "semantic search",
    "category": "AI",
    "definition": "Search that understands intent, not just keywords"
  },
  {
    "rank": 435,
    "difficulty": "moderate",
    "first": "function",
    "second": "calling",
    "term": "function calling",
    "category": "AI",
    "definition": "AI requesting specific code functions with parameters"
  },
  {
    "rank": 436,
    "difficulty": "moderate",
    "first": "sprint",
    "second": "planning",
    "term": "sprint planning",
    "category": "Workflow",
    "definition": "Meeting to decide work for the next sprint"
  },
  {
    "rank": 437,
    "difficulty": "moderate",
    "first": "raster",
    "second": "image",
    "term": "raster image",
    "category": "Tools",
    "definition": "Image made from a grid of pixels"
  },
  {
    "rank": 438,
    "difficulty": "moderate",
    "first": "computer",
    "second": "vision",
    "term": "computer vision",
    "category": "AI",
    "definition": "AI that interprets images and video"
  },
  {
    "rank": 439,
    "difficulty": "moderate",
    "first": "trust",
    "second": "signal",
    "term": "trust signal",
    "category": "AI",
    "definition": "Cue that helps users judge AI reliability"
  },
  {
    "rank": 440,
    "difficulty": "moderate",
    "first": "digital",
    "second": "twin",
    "term": "digital twin",
    "category": "AI",
    "definition": "Virtual replica of a real object or system"
  },
  {
    "rank": 441,
    "difficulty": "moderate",
    "first": "foot",
    "second": "note",
    "term": "footnote",
    "category": "Typography",
    "definition": "Small note at a page's bottom"
  },
  {
    "rank": 442,
    "difficulty": "moderate",
    "first": "color",
    "second": "profile",
    "term": "color profile",
    "category": "Color",
    "definition": "Data describing how colors display across devices"
  },
  {
    "rank": 443,
    "difficulty": "moderate",
    "first": "text",
    "second": "layer",
    "term": "text layer",
    "category": "Tools",
    "definition": "Editable layer containing live type"
  },
  {
    "rank": 444,
    "difficulty": "moderate",
    "first": "zoom",
    "second": "tool",
    "term": "zoom tool",
    "category": "Tools",
    "definition": "Tool for magnifying part of the canvas"
  },
  {
    "rank": 445,
    "difficulty": "moderate",
    "first": "feature",
    "second": "creep",
    "term": "feature creep",
    "category": "Workflow",
    "definition": "Endless addition of features that bloats a product"
  },
  {
    "rank": 446,
    "difficulty": "moderate",
    "first": "tool",
    "second": "calling",
    "term": "tool calling",
    "category": "AI",
    "definition": "AI triggering functions or apps during a task"
  },
  {
    "rank": 447,
    "difficulty": "moderate",
    "first": "shape",
    "second": "layer",
    "term": "shape layer",
    "category": "Tools",
    "definition": "Layer containing an editable vector shape"
  },
  {
    "rank": 448,
    "difficulty": "moderate",
    "first": "white",
    "second": "balance",
    "term": "white balance",
    "category": "Color",
    "definition": "Correcting color so whites appear neutral"
  },
  {
    "rank": 449,
    "difficulty": "moderate",
    "first": "visual",
    "second": "language",
    "term": "visual language",
    "category": "Brand",
    "definition": "Shared set of visual styles and rules"
  },
  {
    "rank": 450,
    "difficulty": "moderate",
    "first": "ai",
    "second": "native",
    "term": "AI native",
    "category": "AI",
    "definition": "Built around AI from the start"
  },
  {
    "rank": 451,
    "difficulty": "moderate",
    "first": "design",
    "second": "token",
    "term": "design token",
    "category": "Workflow",
    "definition": "Named value storing a style decision like color or spacing"
  },
  {
    "rank": 452,
    "difficulty": "moderate",
    "first": "print",
    "second": "design",
    "term": "print design",
    "category": "Print",
    "definition": "Designing for physical printed materials"
  },
  {
    "rank": 453,
    "difficulty": "moderate",
    "first": "column",
    "second": "grid",
    "term": "column grid",
    "category": "Layout",
    "definition": "Layout divided into vertical columns"
  },
  {
    "rank": 454,
    "difficulty": "moderate",
    "first": "shimmer",
    "second": "effect",
    "term": "shimmer effect",
    "category": "AI",
    "definition": "Glowing animation showing AI is working"
  },
  {
    "rank": 455,
    "difficulty": "moderate",
    "first": "sub",
    "second": "head",
    "term": "subhead",
    "category": "Typography",
    "definition": "Secondary heading below the main headline"
  },
  {
    "rank": 456,
    "difficulty": "moderate",
    "first": "scope",
    "second": "creep",
    "term": "scope creep",
    "category": "Workflow",
    "definition": "Project requirements growing beyond the original plan"
  },
  {
    "rank": 457,
    "difficulty": "moderate",
    "first": "visual",
    "second": "balance",
    "term": "visual balance",
    "category": "Layout",
    "definition": "Even distribution of visual weight"
  },
  {
    "rank": 458,
    "difficulty": "moderate",
    "first": "auto",
    "second": "mask",
    "term": "auto mask",
    "category": "AI",
    "definition": "AI generating a mask around a subject"
  },
  {
    "rank": 459,
    "difficulty": "moderate",
    "first": "layout",
    "second": "grid",
    "term": "layout grid",
    "category": "Layout",
    "definition": "Columns and rows guiding where elements go"
  },
  {
    "rank": 460,
    "difficulty": "moderate",
    "first": "color",
    "second": "balance",
    "term": "color balance",
    "category": "Color",
    "definition": "Adjusting color casts across an image"
  },
  {
    "rank": 461,
    "difficulty": "moderate",
    "first": "cookie",
    "second": "banner",
    "term": "cookie banner",
    "category": "UI",
    "definition": "Notice asking users to accept cookies"
  },
  {
    "rank": 462,
    "difficulty": "moderate",
    "first": "suggestion",
    "second": "chip",
    "term": "suggestion chip",
    "category": "AI",
    "definition": "Tappable pill offering a suggested reply or prompt"
  },
  {
    "rank": 463,
    "difficulty": "moderate",
    "first": "pinch",
    "second": "zoom",
    "term": "pinch zoom",
    "category": "UI",
    "definition": "Two-finger gesture to zoom in or out"
  },
  {
    "rank": 464,
    "difficulty": "moderate",
    "first": "post",
    "second": "card",
    "term": "postcard",
    "category": "Print",
    "definition": "Card mailed without an envelope"
  },
  {
    "rank": 465,
    "difficulty": "moderate",
    "first": "generative",
    "second": "fill",
    "term": "generative fill",
    "category": "AI",
    "definition": "AI filling a selection with new content"
  },
  {
    "rank": 466,
    "difficulty": "moderate",
    "first": "auto",
    "second": "pilot",
    "term": "autopilot",
    "category": "AI",
    "definition": "AI completing tasks without step-by-step input"
  },
  {
    "rank": 467,
    "difficulty": "moderate",
    "first": "responsible",
    "second": "ai",
    "term": "responsible AI",
    "category": "AI",
    "definition": "Building AI that is safe, fair, and accountable"
  },
  {
    "rank": 468,
    "difficulty": "moderate",
    "first": "edge",
    "second": "ai",
    "term": "edge AI",
    "category": "AI",
    "definition": "AI running on-device instead of the cloud"
  },
  {
    "rank": 469,
    "difficulty": "moderate",
    "first": "neural",
    "second": "network",
    "term": "neural network",
    "category": "AI",
    "definition": "Layers of connected nodes that learn patterns"
  },
  {
    "rank": 470,
    "difficulty": "moderate",
    "first": "generative",
    "second": "search",
    "term": "generative search",
    "category": "AI",
    "definition": "Search that writes answers instead of listing links"
  },
  {
    "rank": 471,
    "difficulty": "moderate",
    "first": "shadow",
    "second": "ai",
    "term": "shadow AI",
    "category": "AI",
    "definition": "Unapproved AI tools used at work"
  },
  {
    "rank": 472,
    "difficulty": "moderate",
    "first": "click",
    "second": "through",
    "term": "clickthrough",
    "category": "Tools",
    "definition": "Linked prototype users can click from screen to screen"
  },
  {
    "rank": 473,
    "difficulty": "moderate",
    "first": "drop",
    "second": "cap",
    "term": "drop cap",
    "category": "Typography",
    "definition": "Large first letter spanning several lines"
  },
  {
    "rank": 474,
    "difficulty": "moderate",
    "first": "pixel",
    "second": "pushing",
    "term": "pixel pushing",
    "category": "Workflow",
    "definition": "Tweaking tiny visual details, sometimes endlessly"
  },
  {
    "rank": 475,
    "difficulty": "moderate",
    "first": "adjustment",
    "second": "layer",
    "term": "adjustment layer",
    "category": "Tools",
    "definition": "Layer applying edits like brightness non-destructively"
  },
  {
    "rank": 476,
    "difficulty": "moderate",
    "first": "line",
    "second": "length",
    "term": "line length",
    "category": "Typography",
    "definition": "Number of characters per line of text"
  },
  {
    "rank": 477,
    "difficulty": "moderate",
    "first": "tone",
    "second": "curve",
    "term": "tone curve",
    "category": "Color",
    "definition": "Graph adjusting brightness across an image's tones"
  },
  {
    "rank": 478,
    "difficulty": "moderate",
    "first": "ux",
    "second": "writing",
    "term": "UX writing",
    "category": "UX",
    "definition": "Crafting the words users see inside a product"
  },
  {
    "rank": 479,
    "difficulty": "moderate",
    "first": "layer",
    "second": "mask",
    "term": "layer mask",
    "category": "Tools",
    "definition": "Hides parts of a layer without deleting pixels"
  },
  {
    "rank": 480,
    "difficulty": "moderate",
    "first": "full",
    "second": "width",
    "term": "full width",
    "category": "Layout",
    "definition": "Stretching across the entire screen"
  },
  {
    "rank": 481,
    "difficulty": "moderate",
    "first": "pull",
    "second": "quote",
    "term": "pull quote",
    "category": "Typography",
    "definition": "Enlarged excerpt highlighted within an article"
  },
  {
    "rank": 482,
    "difficulty": "moderate",
    "first": "modular",
    "second": "grid",
    "term": "modular grid",
    "category": "Layout",
    "definition": "Grid of columns and rows forming modules"
  },
  {
    "rank": 483,
    "difficulty": "moderate",
    "first": "image",
    "second": "grid",
    "term": "image grid",
    "category": "AI",
    "definition": "Set of AI results shown together to compare"
  },
  {
    "rank": 484,
    "difficulty": "moderate",
    "first": "packaging",
    "second": "design",
    "term": "packaging design",
    "category": "Print",
    "definition": "Designing the look and structure of product packaging"
  },
  {
    "rank": 485,
    "difficulty": "moderate",
    "first": "fixed",
    "second": "width",
    "term": "fixed width",
    "category": "Layout",
    "definition": "Layout that keeps one width on all screens"
  },
  {
    "rank": 486,
    "difficulty": "moderate",
    "first": "max",
    "second": "width",
    "term": "max width",
    "category": "Layout",
    "definition": "Largest width an element can grow to"
  },
  {
    "rank": 487,
    "difficulty": "moderate",
    "first": "stop",
    "second": "motion",
    "term": "stop motion",
    "category": "Motion",
    "definition": "Animation made from photographed physical objects"
  },
  {
    "rank": 488,
    "difficulty": "moderate",
    "first": "design",
    "second": "sprint",
    "term": "design sprint",
    "category": "Workflow",
    "definition": "Five-day process to prototype and test an idea"
  },
  {
    "rank": 489,
    "difficulty": "moderate",
    "first": "ui",
    "second": "kit",
    "term": "UI kit",
    "category": "Tools",
    "definition": "Ready-made set of interface components and styles"
  },
  {
    "rank": 490,
    "difficulty": "moderate",
    "first": "bit",
    "second": "map",
    "term": "bitmap",
    "category": "Tools",
    "definition": "Image made of pixels rather than vectors"
  },
  {
    "rank": 491,
    "difficulty": "moderate",
    "first": "print",
    "second": "proof",
    "term": "print proof",
    "category": "Print",
    "definition": "Test print checked before the full run"
  },
  {
    "rank": 492,
    "difficulty": "moderate",
    "first": "temperature",
    "second": "setting",
    "term": "temperature setting",
    "category": "AI",
    "definition": "Controls how random or predictable AI output is"
  },
  {
    "rank": 493,
    "difficulty": "moderate",
    "first": "under",
    "second": "tone",
    "term": "undertone",
    "category": "Color",
    "definition": "Subtle color beneath the dominant hue"
  },
  {
    "rank": 494,
    "difficulty": "moderate",
    "first": "pattern",
    "second": "library",
    "term": "pattern library",
    "category": "Tools",
    "definition": "Documented collection of reusable design patterns"
  },
  {
    "rank": 495,
    "difficulty": "moderate",
    "first": "masonry",
    "second": "grid",
    "term": "masonry grid",
    "category": "Layout",
    "definition": "Staggered layout of items with varying heights"
  },
  {
    "rank": 496,
    "difficulty": "moderate",
    "first": "smart",
    "second": "crop",
    "term": "smart crop",
    "category": "AI",
    "definition": "AI cropping around the most important subject"
  },
  {
    "rank": 497,
    "difficulty": "moderate",
    "first": "output",
    "second": "format",
    "term": "output format",
    "category": "AI",
    "definition": "Shape a response should take"
  },
  {
    "rank": 498,
    "difficulty": "moderate",
    "first": "screen",
    "second": "reader",
    "term": "screen reader",
    "category": "UX",
    "definition": "Software that reads screen content aloud"
  },
  {
    "rank": 499,
    "difficulty": "moderate",
    "first": "slow",
    "second": "motion",
    "term": "slow motion",
    "category": "Motion",
    "definition": "Footage played slower than real time"
  },
  {
    "rank": 500,
    "difficulty": "moderate",
    "first": "remote",
    "second": "testing",
    "term": "remote testing",
    "category": "UX",
    "definition": "Usability testing done online from different locations"
  },
  {
    "rank": 501,
    "difficulty": "moderate",
    "first": "content",
    "second": "audit",
    "term": "content audit",
    "category": "UX",
    "definition": "Inventory and review of all existing content"
  },
  {
    "rank": 502,
    "difficulty": "moderate",
    "first": "image",
    "second": "trace",
    "term": "image trace",
    "category": "Tools",
    "definition": "Converting a pixel image into vector paths"
  },
  {
    "rank": 503,
    "difficulty": "moderate",
    "first": "reasoning",
    "second": "trace",
    "term": "reasoning trace",
    "category": "AI",
    "definition": "Visible record of an AI's thinking steps"
  },
  {
    "rank": 504,
    "difficulty": "moderate",
    "first": "component",
    "second": "library",
    "term": "component library",
    "category": "Tools",
    "definition": "Shared collection of reusable interface components"
  },
  {
    "rank": 505,
    "difficulty": "moderate",
    "first": "pixel",
    "second": "density",
    "term": "pixel density",
    "category": "UI",
    "definition": "Number of pixels per inch on a screen"
  },
  {
    "rank": 506,
    "difficulty": "moderate",
    "first": "file",
    "second": "format",
    "term": "file format",
    "category": "Tools",
    "definition": "Type of file, like PNG, SVG, or PDF"
  },
  {
    "rank": 507,
    "difficulty": "moderate",
    "first": "healing",
    "second": "brush",
    "term": "healing brush",
    "category": "Tools",
    "definition": "Tool blending away blemishes using nearby texture"
  },
  {
    "rank": 508,
    "difficulty": "moderate",
    "first": "prompt",
    "second": "library",
    "term": "prompt library",
    "category": "AI",
    "definition": "Saved collection of reusable, proven prompts"
  },
  {
    "rank": 509,
    "difficulty": "moderate",
    "first": "asset",
    "second": "library",
    "term": "asset library",
    "category": "Tools",
    "definition": "Central store of reusable images, icons, and files"
  },
  {
    "rank": 510,
    "difficulty": "moderate",
    "first": "beta",
    "second": "testing",
    "term": "beta testing",
    "category": "UX",
    "definition": "Real users trying a product before full release"
  },
  {
    "rank": 511,
    "difficulty": "moderate",
    "first": "letter",
    "second": "press",
    "term": "letterpress",
    "category": "Print",
    "definition": "Printing by pressing inked raised type into paper"
  },
  {
    "rank": 512,
    "difficulty": "moderate",
    "first": "ambient",
    "second": "ai",
    "term": "ambient AI",
    "category": "AI",
    "definition": "AI working quietly in the background"
  },
  {
    "rank": 513,
    "difficulty": "moderate",
    "first": "icon",
    "second": "library",
    "term": "icon library",
    "category": "Tools",
    "definition": "Collection of icons ready for reuse"
  },
  {
    "rank": 514,
    "difficulty": "moderate",
    "first": "lasso",
    "second": "tool",
    "term": "lasso tool",
    "category": "Tools",
    "definition": "Tool for drawing freehand selections"
  },
  {
    "rank": 515,
    "difficulty": "moderate",
    "first": "art",
    "second": "print",
    "term": "art print",
    "category": "Print",
    "definition": "Reproduction of artwork on quality paper"
  },
  {
    "rank": 516,
    "difficulty": "moderate",
    "first": "re",
    "second": "roll",
    "term": "reroll",
    "category": "AI",
    "definition": "Generating again for a different result"
  },
  {
    "rank": 517,
    "difficulty": "moderate",
    "first": "design",
    "second": "spec",
    "term": "design spec",
    "category": "Workflow",
    "definition": "Detailed document describing how a design works"
  },
  {
    "rank": 518,
    "difficulty": "moderate",
    "first": "logo",
    "second": "mark",
    "term": "logomark",
    "category": "Brand",
    "definition": "Symbol part of a logo without text"
  },
  {
    "rank": 519,
    "difficulty": "moderate",
    "first": "letter",
    "second": "form",
    "term": "letterform",
    "category": "Typography",
    "definition": "The shape of an individual letter"
  },
  {
    "rank": 520,
    "difficulty": "moderate",
    "first": "screen",
    "second": "print",
    "term": "screen print",
    "category": "Print",
    "definition": "Printing by pushing ink through a mesh stencil"
  },
  {
    "rank": 521,
    "difficulty": "moderate",
    "first": "tool",
    "second": "kit",
    "term": "toolkit",
    "category": "Tools",
    "definition": "Collection of resources or components for a task"
  },
  {
    "rank": 522,
    "difficulty": "moderate",
    "first": "micro",
    "second": "copy",
    "term": "microcopy",
    "category": "UX",
    "definition": "Tiny bits of interface text like labels and hints"
  },
  {
    "rank": 523,
    "difficulty": "moderate",
    "first": "component",
    "second": "property",
    "term": "component property",
    "category": "Tools",
    "definition": "Setting that customizes a component instance"
  },
  {
    "rank": 524,
    "difficulty": "moderate",
    "first": "brand",
    "second": "strategy",
    "term": "brand strategy",
    "category": "Brand",
    "definition": "Long-term plan for how a brand is perceived"
  },
  {
    "rank": 525,
    "difficulty": "moderate",
    "first": "streaming",
    "second": "response",
    "term": "streaming response",
    "category": "AI",
    "definition": "AI answer appearing word by word"
  },
  {
    "rank": 526,
    "difficulty": "moderate",
    "first": "mono",
    "second": "space",
    "term": "monospace",
    "category": "Typography",
    "definition": "Font where every character has equal width"
  },
  {
    "rank": 527,
    "difficulty": "moderate",
    "first": "transfer",
    "second": "learning",
    "term": "transfer learning",
    "category": "AI",
    "definition": "Reusing knowledge from one task for another"
  },
  {
    "rank": 528,
    "difficulty": "moderate",
    "first": "infinite",
    "second": "scroll",
    "term": "infinite scroll",
    "category": "UI",
    "definition": "Content that keeps loading as you scroll"
  },
  {
    "rank": 529,
    "difficulty": "moderate",
    "first": "gutter",
    "second": "width",
    "term": "gutter width",
    "category": "Layout",
    "definition": "Space between columns in a grid"
  },
  {
    "rank": 530,
    "difficulty": "moderate",
    "first": "tool",
    "second": "chain",
    "term": "toolchain",
    "category": "AI",
    "definition": "Set of tools used together in a workflow"
  },
  {
    "rank": 531,
    "difficulty": "moderate",
    "first": "structured",
    "second": "output",
    "term": "structured output",
    "category": "AI",
    "definition": "AI response in a set format like JSON"
  },
  {
    "rank": 532,
    "difficulty": "moderate",
    "first": "sticky",
    "second": "header",
    "term": "sticky header",
    "category": "UI",
    "definition": "Header that stays visible while scrolling"
  },
  {
    "rank": 533,
    "difficulty": "moderate",
    "first": "bento",
    "second": "grid",
    "term": "bento grid",
    "category": "Layout",
    "definition": "Layout of varied rectangular tiles, like a lunchbox"
  },
  {
    "rank": 534,
    "difficulty": "moderate",
    "first": "safety",
    "second": "filter",
    "term": "safety filter",
    "category": "AI",
    "definition": "System blocking harmful AI outputs"
  },
  {
    "rank": 535,
    "difficulty": "moderate",
    "first": "content",
    "second": "filter",
    "term": "content filter",
    "category": "AI",
    "definition": "Screening that blocks inappropriate content"
  },
  {
    "rank": 536,
    "difficulty": "moderate",
    "first": "clipping",
    "second": "mask",
    "term": "clipping mask",
    "category": "Tools",
    "definition": "Uses one shape to limit another's visible area"
  },
  {
    "rank": 537,
    "difficulty": "moderate",
    "first": "pixel",
    "second": "grid",
    "term": "pixel grid",
    "category": "Tools",
    "definition": "Grid aligning shapes to whole pixels for crispness"
  },
  {
    "rank": 538,
    "difficulty": "moderate",
    "first": "art",
    "second": "direction",
    "term": "art direction",
    "category": "Brand",
    "definition": "Guiding the overall visual style of a project"
  },
  {
    "rank": 539,
    "difficulty": "moderate",
    "first": "content",
    "second": "strategy",
    "term": "content strategy",
    "category": "UX",
    "definition": "Planning what content to create and why"
  },
  {
    "rank": 540,
    "difficulty": "moderate",
    "first": "conversational",
    "second": "ai",
    "term": "conversational AI",
    "category": "AI",
    "definition": "AI designed for natural dialogue"
  },
  {
    "rank": 541,
    "difficulty": "moderate",
    "first": "sparkle",
    "second": "icon",
    "term": "sparkle icon",
    "category": "AI",
    "definition": "Star-like symbol commonly marking AI features"
  },
  {
    "rank": 542,
    "difficulty": "moderate",
    "first": "regenerate",
    "second": "button",
    "term": "regenerate button",
    "category": "AI",
    "definition": "Control asking AI for a new response"
  },
  {
    "rank": 543,
    "difficulty": "moderate",
    "first": "card",
    "second": "layout",
    "term": "card layout",
    "category": "Layout",
    "definition": "Content arranged in separate rectangular cards"
  },
  {
    "rank": 544,
    "difficulty": "moderate",
    "first": "sub",
    "second": "agent",
    "term": "subagent",
    "category": "AI",
    "definition": "Helper AI handling part of a larger task"
  },
  {
    "rank": 545,
    "difficulty": "moderate",
    "first": "problem",
    "second": "statement",
    "term": "problem statement",
    "category": "UX",
    "definition": "Clear description of the user problem to solve"
  },
  {
    "rank": 546,
    "difficulty": "moderate",
    "first": "face",
    "second": "swap",
    "term": "face swap",
    "category": "AI",
    "definition": "Replacing one person's face with another's"
  },
  {
    "rank": 547,
    "difficulty": "moderate",
    "first": "extra",
    "second": "fingers",
    "term": "extra fingers",
    "category": "AI",
    "definition": "Classic AI image flaw with too many fingers"
  },
  {
    "rank": 548,
    "difficulty": "moderate",
    "first": "visual",
    "second": "rhythm",
    "term": "visual rhythm",
    "category": "Layout",
    "definition": "Repeating elements creating a sense of flow"
  },
  {
    "rank": 549,
    "difficulty": "moderate",
    "first": "visual",
    "second": "identity",
    "term": "visual identity",
    "category": "Brand",
    "definition": "Visible elements that make a brand recognizable"
  },
  {
    "rank": 550,
    "difficulty": "moderate",
    "first": "stroke",
    "second": "width",
    "term": "stroke width",
    "category": "Tools",
    "definition": "Thickness of a shape's outline"
  },
  {
    "rank": 551,
    "difficulty": "moderate",
    "first": "clone",
    "second": "stamp",
    "term": "clone stamp",
    "category": "Tools",
    "definition": "Tool copying pixels from one area to another"
  },
  {
    "rank": 552,
    "difficulty": "moderate",
    "first": "color",
    "second": "ramp",
    "term": "color ramp",
    "category": "Color",
    "definition": "Sequence of shades from light to dark"
  },
  {
    "rank": 553,
    "difficulty": "moderate",
    "first": "color",
    "second": "token",
    "term": "color token",
    "category": "Color",
    "definition": "Named variable storing a color value"
  },
  {
    "rank": 554,
    "difficulty": "moderate",
    "first": "sentiment",
    "second": "analysis",
    "term": "sentiment analysis",
    "category": "AI",
    "definition": "Detecting emotion or opinion in text"
  },
  {
    "rank": 555,
    "difficulty": "moderate",
    "first": "text",
    "second": "wrap",
    "term": "text wrap",
    "category": "Typography",
    "definition": "How text flows around an image or shape"
  },
  {
    "rank": 556,
    "difficulty": "moderate",
    "first": "style",
    "second": "transfer",
    "term": "style transfer",
    "category": "AI",
    "definition": "Applying one image's style to another"
  },
  {
    "rank": 557,
    "difficulty": "moderate",
    "first": "neural",
    "second": "filter",
    "term": "neural filter",
    "category": "AI",
    "definition": "AI-powered image effect in an editing tool"
  },
  {
    "rank": 558,
    "difficulty": "moderate",
    "first": "ai",
    "second": "ethics",
    "term": "AI ethics",
    "category": "AI",
    "definition": "Principles for building and using AI responsibly"
  },
  {
    "rank": 559,
    "difficulty": "moderate",
    "first": "spacing",
    "second": "token",
    "term": "spacing token",
    "category": "Layout",
    "definition": "Named variable storing a spacing value"
  },
  {
    "rank": 560,
    "difficulty": "moderate",
    "first": "small",
    "second": "caps",
    "term": "small caps",
    "category": "Typography",
    "definition": "Capital letters sized to match lowercase height"
  },
  {
    "rank": 561,
    "difficulty": "moderate",
    "first": "nav",
    "second": "drawer",
    "term": "nav drawer",
    "category": "UI",
    "definition": "Hidden navigation panel that slides in from the edge"
  },
  {
    "rank": 562,
    "difficulty": "moderate",
    "first": "duo",
    "second": "tone",
    "term": "duotone",
    "category": "Color",
    "definition": "Image made from two contrasting colors"
  },
  {
    "rank": 563,
    "difficulty": "moderate",
    "first": "asset",
    "second": "export",
    "term": "asset export",
    "category": "Tools",
    "definition": "Saving design elements as files for developers"
  },
  {
    "rank": 564,
    "difficulty": "moderate",
    "first": "data",
    "second": "privacy",
    "term": "data privacy",
    "category": "AI",
    "definition": "Protecting personal information from misuse"
  },
  {
    "rank": 565,
    "difficulty": "moderate",
    "first": "lip",
    "second": "sync",
    "term": "lip sync",
    "category": "AI",
    "definition": "Matching mouth movement to audio"
  },
  {
    "rank": 566,
    "difficulty": "moderate",
    "first": "meeting",
    "second": "summary",
    "term": "meeting summary",
    "category": "AI",
    "definition": "AI-written recap of a meeting's key points"
  },
  {
    "rank": 567,
    "difficulty": "moderate",
    "first": "key",
    "second": "frame",
    "term": "keyframe",
    "category": "Motion",
    "definition": "Point defining an element's state in an animation"
  },
  {
    "rank": 568,
    "difficulty": "moderate",
    "first": "explainable",
    "second": "ai",
    "term": "explainable AI",
    "category": "AI",
    "definition": "AI whose decisions can be understood"
  },
  {
    "rank": 569,
    "difficulty": "moderate",
    "first": "easing",
    "second": "curve",
    "term": "easing curve",
    "category": "Motion",
    "definition": "Graph controlling an animation's acceleration"
  },
  {
    "rank": 570,
    "difficulty": "moderate",
    "first": "reinforcement",
    "second": "learning",
    "term": "reinforcement learning",
    "category": "AI",
    "definition": "Training by rewarding good outcomes"
  },
  {
    "rank": 571,
    "difficulty": "moderate",
    "first": "style",
    "second": "sheet",
    "term": "stylesheet",
    "category": "Tools",
    "definition": "File defining styles, like CSS for a website"
  },
  {
    "rank": 572,
    "difficulty": "moderate",
    "first": "object",
    "second": "removal",
    "term": "object removal",
    "category": "AI",
    "definition": "AI erasing unwanted items from an image"
  },
  {
    "rank": 573,
    "difficulty": "moderate",
    "first": "baseline",
    "second": "grid",
    "term": "baseline grid",
    "category": "Typography",
    "definition": "Horizontal lines aligning all text baselines"
  },
  {
    "rank": 574,
    "difficulty": "moderate",
    "first": "large",
    "second": "format",
    "term": "large format",
    "category": "Print",
    "definition": "Printing on big sizes like posters and banners"
  },
  {
    "rank": 575,
    "difficulty": "moderate",
    "first": "swipe",
    "second": "gesture",
    "term": "swipe gesture",
    "category": "UI",
    "definition": "Sliding a finger across a touchscreen to act"
  },
  {
    "rank": 576,
    "difficulty": "moderate",
    "first": "design",
    "second": "principle",
    "term": "design principle",
    "category": "Workflow",
    "definition": "Guiding rule shaping design decisions"
  },
  {
    "rank": 577,
    "difficulty": "moderate",
    "first": "auto",
    "second": "layout",
    "term": "auto layout",
    "category": "Tools",
    "definition": "Feature that resizes and spaces elements automatically"
  },
  {
    "rank": 578,
    "difficulty": "moderate",
    "first": "color",
    "second": "contrast",
    "term": "color contrast",
    "category": "Color",
    "definition": "Difference between colors affecting readability"
  },
  {
    "rank": 579,
    "difficulty": "moderate",
    "first": "success",
    "second": "metric",
    "term": "success metric",
    "category": "UX",
    "definition": "Measure showing whether a design meets its goal"
  },
  {
    "rank": 580,
    "difficulty": "moderate",
    "first": "voice",
    "second": "clone",
    "term": "voice clone",
    "category": "AI",
    "definition": "AI copy of a real person's voice"
  },
  {
    "rank": 581,
    "difficulty": "moderate",
    "first": "command",
    "second": "palette",
    "term": "command palette",
    "category": "UI",
    "definition": "Searchable list of every command, opened by shortcut"
  },
  {
    "rank": 582,
    "difficulty": "moderate",
    "first": "color",
    "second": "harmony",
    "term": "color harmony",
    "category": "Color",
    "definition": "Pleasing combination of colors"
  },
  {
    "rank": 583,
    "difficulty": "moderate",
    "first": "style",
    "second": "reference",
    "term": "style reference",
    "category": "AI",
    "definition": "Image guiding the look of AI generations"
  },
  {
    "rank": 584,
    "difficulty": "moderate",
    "first": "auto",
    "second": "complete",
    "term": "autocomplete",
    "category": "AI",
    "definition": "Predicting and suggesting what you'll type next"
  },
  {
    "rank": 585,
    "difficulty": "moderate",
    "first": "system",
    "second": "prompt",
    "term": "system prompt",
    "category": "AI",
    "definition": "Hidden instructions setting an AI's behavior"
  },
  {
    "rank": 586,
    "difficulty": "moderate",
    "first": "image",
    "second": "prompt",
    "term": "image prompt",
    "category": "AI",
    "definition": "Picture supplied to guide an AI's output"
  },
  {
    "rank": 587,
    "difficulty": "moderate",
    "first": "negative",
    "second": "prompt",
    "term": "negative prompt",
    "category": "AI",
    "definition": "Describes what an image generator should avoid"
  },
  {
    "rank": 588,
    "difficulty": "moderate",
    "first": "paper",
    "second": "texture",
    "term": "paper texture",
    "category": "Brand",
    "definition": "Overlay mimicking the grain of real paper"
  },
  {
    "rank": 589,
    "difficulty": "moderate",
    "first": "starter",
    "second": "prompt",
    "term": "starter prompt",
    "category": "AI",
    "definition": "Example prompt shown in an empty AI interface"
  },
  {
    "rank": 590,
    "difficulty": "moderate",
    "first": "foil",
    "second": "stamp",
    "term": "foil stamp",
    "category": "Print",
    "definition": "Metallic foil pressed onto paper with heat"
  },
  {
    "rank": 591,
    "difficulty": "moderate",
    "first": "vector",
    "second": "graphic",
    "term": "vector graphic",
    "category": "Tools",
    "definition": "Image made of paths that scale without blur"
  },
  {
    "rank": 592,
    "difficulty": "moderate",
    "first": "virtual",
    "second": "assistant",
    "term": "virtual assistant",
    "category": "AI",
    "definition": "Software helper that completes tasks for you"
  },
  {
    "rank": 593,
    "difficulty": "moderate",
    "first": "mono",
    "second": "chrome",
    "term": "monochrome",
    "category": "Color",
    "definition": "Using variations of a single color"
  },
  {
    "rank": 594,
    "difficulty": "moderate",
    "first": "eye",
    "second": "tracking",
    "term": "eye tracking",
    "category": "UX",
    "definition": "Measuring where a user's gaze lands on a screen"
  },
  {
    "rank": 595,
    "difficulty": "moderate",
    "first": "human",
    "second": "feedback",
    "term": "human feedback",
    "category": "AI",
    "definition": "People rating AI outputs to improve it"
  },
  {
    "rank": 596,
    "difficulty": "moderate",
    "first": "system",
    "second": "font",
    "term": "system font",
    "category": "Typography",
    "definition": "Default font built into an operating system"
  },
  {
    "rank": 597,
    "difficulty": "moderate",
    "first": "web",
    "second": "font",
    "term": "web font",
    "category": "Typography",
    "definition": "Font loaded online for use on websites"
  },
  {
    "rank": 598,
    "difficulty": "moderate",
    "first": "design",
    "second": "critique",
    "term": "design critique",
    "category": "Workflow",
    "definition": "Structured feedback session on work in progress"
  },
  {
    "rank": 599,
    "difficulty": "moderate",
    "first": "script",
    "second": "font",
    "term": "script font",
    "category": "Typography",
    "definition": "Typeface imitating handwriting or calligraphy"
  },
  {
    "rank": 600,
    "difficulty": "moderate",
    "first": "object",
    "second": "selection",
    "term": "object selection",
    "category": "AI",
    "definition": "AI automatically selecting an object"
  },
  {
    "rank": 601,
    "difficulty": "moderate",
    "first": "video",
    "second": "generation",
    "term": "video generation",
    "category": "AI",
    "definition": "Creating video clips with AI"
  },
  {
    "rank": 602,
    "difficulty": "moderate",
    "first": "face",
    "second": "tracking",
    "term": "face tracking",
    "category": "AI",
    "definition": "Following a face's position across video frames"
  },
  {
    "rank": 603,
    "difficulty": "moderate",
    "first": "hand",
    "second": "tracking",
    "term": "hand tracking",
    "category": "AI",
    "definition": "Following hand and finger movement with a camera"
  },
  {
    "rank": 604,
    "difficulty": "moderate",
    "first": "code",
    "second": "generation",
    "term": "code generation",
    "category": "AI",
    "definition": "AI writing code from a description"
  },
  {
    "rank": 605,
    "difficulty": "moderate",
    "first": "range",
    "second": "slider",
    "term": "range slider",
    "category": "UI",
    "definition": "Control for choosing a value by dragging"
  },
  {
    "rank": 606,
    "difficulty": "moderate",
    "first": "fine",
    "second": "tuning",
    "term": "fine-tuning",
    "category": "AI",
    "definition": "Further training a model for a specific task"
  },
  {
    "rank": 607,
    "difficulty": "moderate",
    "first": "guard",
    "second": "rails",
    "term": "guardrails",
    "category": "AI",
    "definition": "Rules keeping AI behavior safe and on-topic"
  },
  {
    "rank": 608,
    "difficulty": "moderate",
    "first": "magic",
    "second": "wand",
    "term": "magic wand",
    "category": "Tools",
    "definition": "Tool selecting areas of similar color"
  },
  {
    "rank": 609,
    "difficulty": "moderate",
    "first": "ai",
    "second": "avatar",
    "term": "AI avatar",
    "category": "AI",
    "definition": "Digital likeness generated by AI"
  },
  {
    "rank": 610,
    "difficulty": "moderate",
    "first": "motion",
    "second": "blur",
    "term": "motion blur",
    "category": "Motion",
    "definition": "Streaking effect that makes movement look smooth"
  },
  {
    "rank": 611,
    "difficulty": "moderate",
    "first": "page",
    "second": "indicator",
    "term": "page indicator",
    "category": "UI",
    "definition": "Dots showing which page of a carousel you're on"
  },
  {
    "rank": 612,
    "difficulty": "moderate",
    "first": "progress",
    "second": "indicator",
    "term": "progress indicator",
    "category": "UI",
    "definition": "Visual showing that something is loading or advancing"
  },
  {
    "rank": 613,
    "difficulty": "moderate",
    "first": "export",
    "second": "settings",
    "term": "export settings",
    "category": "Tools",
    "definition": "Options chosen when saving assets from a file"
  },
  {
    "rank": 614,
    "difficulty": "moderate",
    "first": "brand",
    "second": "refresh",
    "term": "brand refresh",
    "category": "Brand",
    "definition": "Updating a brand's look without a full rebrand"
  },
  {
    "rank": 615,
    "difficulty": "moderate",
    "first": "ai",
    "second": "assisted",
    "term": "AI assisted",
    "category": "AI",
    "definition": "Made by a human with help from AI"
  },
  {
    "rank": 616,
    "difficulty": "moderate",
    "first": "motion",
    "second": "graphics",
    "term": "motion graphics",
    "category": "Motion",
    "definition": "Animated graphic design, often with text"
  },
  {
    "rank": 617,
    "difficulty": "moderate",
    "first": "parallax",
    "second": "scroll",
    "term": "parallax scroll",
    "category": "Motion",
    "definition": "Layers moving at different speeds while scrolling"
  },
  {
    "rank": 618,
    "difficulty": "moderate",
    "first": "time",
    "second": "picker",
    "term": "time picker",
    "category": "UI",
    "definition": "Control for selecting a time of day"
  },
  {
    "rank": 619,
    "difficulty": "moderate",
    "first": "image",
    "second": "caption",
    "term": "image caption",
    "category": "AI",
    "definition": "AI-written description of an image"
  },
  {
    "rank": 620,
    "difficulty": "moderate",
    "first": "high",
    "second": "resolution",
    "term": "high resolution",
    "category": "Tools",
    "definition": "Lots of detail from many pixels"
  },
  {
    "rank": 621,
    "difficulty": "moderate",
    "first": "image",
    "second": "resolution",
    "term": "image resolution",
    "category": "Tools",
    "definition": "Amount of pixel detail in an image"
  },
  {
    "rank": 622,
    "difficulty": "moderate",
    "first": "ai",
    "second": "persona",
    "term": "AI persona",
    "category": "AI",
    "definition": "Personality and voice given to an AI product"
  },
  {
    "rank": 623,
    "difficulty": "moderate",
    "first": "logo",
    "second": "variation",
    "term": "logo variation",
    "category": "Brand",
    "definition": "Alternate version of a logo for different uses"
  },
  {
    "rank": 624,
    "difficulty": "moderate",
    "first": "ai",
    "second": "literacy",
    "term": "AI literacy",
    "category": "AI",
    "definition": "Understanding how to use AI well and critically"
  },
  {
    "rank": 625,
    "difficulty": "moderate",
    "first": "chat",
    "second": "interface",
    "term": "chat interface",
    "category": "AI",
    "definition": "Conversational UI for talking to AI"
  },
  {
    "rank": 626,
    "difficulty": "moderate",
    "first": "color",
    "second": "grading",
    "term": "color grading",
    "category": "Color",
    "definition": "Adjusting colors to set a mood"
  },
  {
    "rank": 627,
    "difficulty": "moderate",
    "first": "multi",
    "second": "modal",
    "term": "multimodal",
    "category": "AI",
    "definition": "Working across text, images, audio, and video"
  },
  {
    "rank": 628,
    "difficulty": "moderate",
    "first": "image",
    "second": "variation",
    "term": "image variation",
    "category": "AI",
    "definition": "Alternative version generated from an existing image"
  },
  {
    "rank": 629,
    "difficulty": "moderate",
    "first": "page",
    "second": "transition",
    "term": "page transition",
    "category": "Motion",
    "definition": "Animation played when moving between screens"
  },
  {
    "rank": 630,
    "difficulty": "moderate",
    "first": "loading",
    "second": "animation",
    "term": "loading animation",
    "category": "Motion",
    "definition": "Animation that entertains users during waits"
  },
  {
    "rank": 631,
    "difficulty": "moderate",
    "first": "micro",
    "second": "animation",
    "term": "micro animation",
    "category": "Motion",
    "definition": "Small subtle animation adding life to UI"
  },
  {
    "rank": 632,
    "difficulty": "moderate",
    "first": "prompt",
    "second": "template",
    "term": "prompt template",
    "category": "AI",
    "definition": "Reusable prompt with blanks to fill in"
  },
  {
    "rank": 633,
    "difficulty": "moderate",
    "first": "scroll",
    "second": "animation",
    "term": "scroll animation",
    "category": "Motion",
    "definition": "Animation triggered by the user's scroll position"
  },
  {
    "rank": 634,
    "difficulty": "moderate",
    "first": "prompt",
    "second": "injection",
    "term": "prompt injection",
    "category": "AI",
    "definition": "Hidden text that tricks an AI into ignoring instructions"
  },
  {
    "rank": 635,
    "difficulty": "moderate",
    "first": "paper",
    "second": "prototype",
    "term": "paper prototype",
    "category": "UX",
    "definition": "Hand-drawn screens used to test ideas"
  },
  {
    "rank": 636,
    "difficulty": "moderate",
    "first": "speech",
    "second": "recognition",
    "term": "speech recognition",
    "category": "AI",
    "definition": "Converting spoken words into text"
  },
  {
    "rank": 637,
    "difficulty": "moderate",
    "first": "sky",
    "second": "replacement",
    "term": "sky replacement",
    "category": "AI",
    "definition": "AI swapping the sky in a photo"
  },
  {
    "rank": 638,
    "difficulty": "moderate",
    "first": "prompt",
    "second": "suggestion",
    "term": "prompt suggestion",
    "category": "AI",
    "definition": "Ready-made prompt offered to help users start"
  },
  {
    "rank": 639,
    "difficulty": "moderate",
    "first": "model",
    "second": "picker",
    "term": "model picker",
    "category": "AI",
    "definition": "UI control for choosing which AI model to use"
  },
  {
    "rank": 640,
    "difficulty": "moderate",
    "first": "font",
    "second": "pairing",
    "term": "font pairing",
    "category": "Typography",
    "definition": "Choosing typefaces that work well together"
  },
  {
    "rank": 641,
    "difficulty": "moderate",
    "first": "style",
    "second": "preset",
    "term": "style preset",
    "category": "AI",
    "definition": "Saved style applied to AI generations"
  },
  {
    "rank": 642,
    "difficulty": "moderate",
    "first": "magic",
    "second": "eraser",
    "term": "magic eraser",
    "category": "AI",
    "definition": "One-tap AI tool that removes distractions"
  },
  {
    "rank": 643,
    "difficulty": "moderate",
    "first": "color",
    "second": "overlay",
    "term": "color overlay",
    "category": "Tools",
    "definition": "Solid color layered over an element"
  },
  {
    "rank": 644,
    "difficulty": "moderate",
    "first": "color",
    "second": "swatch",
    "term": "color swatch",
    "category": "Color",
    "definition": "Saved sample of a specific color"
  },
  {
    "rank": 645,
    "difficulty": "moderate",
    "first": "ai",
    "second": "disclosure",
    "term": "AI disclosure",
    "category": "AI",
    "definition": "Telling users when content involves AI"
  },
  {
    "rank": 646,
    "difficulty": "moderate",
    "first": "information",
    "second": "architecture",
    "term": "information architecture",
    "category": "UX",
    "definition": "Organizing and labeling content so it's easy to find"
  },
  {
    "rank": 647,
    "difficulty": "moderate",
    "first": "type",
    "second": "specimen",
    "term": "type specimen",
    "category": "Typography",
    "definition": "Sample sheet displaying a typeface's characters and styles"
  },
  {
    "rank": 648,
    "difficulty": "moderate",
    "first": "color",
    "second": "blindness",
    "term": "color blindness",
    "category": "UX",
    "definition": "Difficulty distinguishing certain colors"
  },
  {
    "rank": 649,
    "difficulty": "moderate",
    "first": "toast",
    "second": "notification",
    "term": "toast notification",
    "category": "UI",
    "definition": "Small temporary message that pops up and fades"
  },
  {
    "rank": 650,
    "difficulty": "moderate",
    "first": "custom",
    "second": "instructions",
    "term": "custom instructions",
    "category": "AI",
    "definition": "Standing preferences an AI applies to every chat"
  },
  {
    "rank": 651,
    "difficulty": "moderate",
    "first": "type",
    "second": "hierarchy",
    "term": "type hierarchy",
    "category": "Typography",
    "definition": "Using size and weight to show text importance"
  },
  {
    "rank": 652,
    "difficulty": "moderate",
    "first": "value",
    "second": "proposition",
    "term": "value proposition",
    "category": "Brand",
    "definition": "Why a product is worth choosing"
  },
  {
    "rank": 653,
    "difficulty": "moderate",
    "first": "style",
    "second": "consistency",
    "term": "style consistency",
    "category": "AI",
    "definition": "Keeping the same look across AI outputs"
  },
  {
    "rank": 654,
    "difficulty": "moderate",
    "first": "character",
    "second": "consistency",
    "term": "character consistency",
    "category": "AI",
    "definition": "Same character looking identical across images"
  },
  {
    "rank": 655,
    "difficulty": "moderate",
    "first": "slab",
    "second": "serif",
    "term": "slab serif",
    "category": "Typography",
    "definition": "Typeface with thick, block-like serifs"
  },
  {
    "rank": 656,
    "difficulty": "moderate",
    "first": "flat",
    "second": "illustration",
    "term": "flat illustration",
    "category": "Brand",
    "definition": "Simple illustration without shading or depth"
  },
  {
    "rank": 657,
    "difficulty": "moderate",
    "first": "micro",
    "second": "interaction",
    "term": "microinteraction",
    "category": "UI",
    "definition": "Small animated response to a single user action"
  },
  {
    "rank": 658,
    "difficulty": "moderate",
    "first": "content",
    "second": "moderation",
    "term": "content moderation",
    "category": "AI",
    "definition": "Reviewing content for policy violations"
  },
  {
    "rank": 659,
    "difficulty": "moderate",
    "first": "digital",
    "second": "watermark",
    "term": "digital watermark",
    "category": "AI",
    "definition": "Invisible mark identifying AI-generated or owned media"
  },
  {
    "rank": 660,
    "difficulty": "moderate",
    "first": "hand",
    "second": "lettering",
    "term": "hand lettering",
    "category": "Typography",
    "definition": "Drawing letters by hand as illustrations"
  },
  {
    "rank": 661,
    "difficulty": "moderate",
    "first": "virtual",
    "second": "influencer",
    "term": "virtual influencer",
    "category": "AI",
    "definition": "Computer-generated persona active on social media"
  },
  {
    "rank": 662,
    "difficulty": "moderate",
    "first": "rapid",
    "second": "prototyping",
    "term": "rapid prototyping",
    "category": "UX",
    "definition": "Quickly building testable versions of an idea"
  },
  {
    "rank": 663,
    "difficulty": "moderate",
    "first": "glass",
    "second": "morphism",
    "term": "glassmorphism",
    "category": "UI",
    "definition": "Style using frosted, translucent glass-like panels"
  },
  {
    "rank": 664,
    "difficulty": "hard",
    "first": "generative",
    "second": "expand",
    "term": "generative expand",
    "category": "AI",
    "definition": "AI extending the canvas with matching content"
  },
  {
    "rank": 665,
    "difficulty": "hard",
    "first": "font",
    "second": "stack",
    "term": "font stack",
    "category": "Typography",
    "definition": "Ordered list of fallback fonts in CSS"
  },
  {
    "rank": 666,
    "difficulty": "hard",
    "first": "character",
    "second": "reference",
    "term": "character reference",
    "category": "AI",
    "definition": "Image keeping a character the same across generations"
  },
  {
    "rank": 667,
    "difficulty": "hard",
    "first": "mid",
    "second": "tone",
    "term": "midtone",
    "category": "Color",
    "definition": "Tones between an image's shadows and highlights"
  },
  {
    "rank": 668,
    "difficulty": "hard",
    "first": "dust",
    "second": "jacket",
    "term": "dust jacket",
    "category": "Print",
    "definition": "Removable printed wrapper around a hardcover book"
  },
  {
    "rank": 669,
    "difficulty": "hard",
    "first": "noise",
    "second": "texture",
    "term": "noise texture",
    "category": "Brand",
    "definition": "Grainy overlay adding subtle tactile depth"
  },
  {
    "rank": 670,
    "difficulty": "hard",
    "first": "meta",
    "second": "prompt",
    "term": "meta prompt",
    "category": "AI",
    "definition": "Prompt that asks AI to write prompts"
  },
  {
    "rank": 671,
    "difficulty": "hard",
    "first": "bezier",
    "second": "curve",
    "term": "bezier curve",
    "category": "Tools",
    "definition": "Curve shaped by control points and handles"
  },
  {
    "rank": 672,
    "difficulty": "hard",
    "first": "block",
    "second": "quote",
    "term": "blockquote",
    "category": "Typography",
    "definition": "Indented longer quotation set apart from text"
  },
  {
    "rank": 673,
    "difficulty": "hard",
    "first": "variable",
    "second": "font",
    "term": "variable font",
    "category": "Typography",
    "definition": "Single font file with adjustable weight and width"
  },
  {
    "rank": 674,
    "difficulty": "hard",
    "first": "cross",
    "second": "functional",
    "term": "cross-functional",
    "category": "Workflow",
    "definition": "Involving people from different teams and skills"
  },
  {
    "rank": 675,
    "difficulty": "hard",
    "first": "boolean",
    "second": "operation",
    "term": "boolean operation",
    "category": "Tools",
    "definition": "Combining shapes by union, subtract, intersect, or exclude"
  },
  {
    "rank": 676,
    "difficulty": "hard",
    "first": "full",
    "second": "bleed",
    "term": "full bleed",
    "category": "Print",
    "definition": "Artwork extending past the trim to the page edge"
  },
  {
    "rank": 677,
    "difficulty": "hard",
    "first": "motion",
    "second": "tracking",
    "term": "motion tracking",
    "category": "Motion",
    "definition": "Following a moving object across video frames"
  },
  {
    "rank": 678,
    "difficulty": "hard",
    "first": "max",
    "second": "tokens",
    "term": "max tokens",
    "category": "AI",
    "definition": "Setting capping how long a response can be"
  },
  {
    "rank": 679,
    "difficulty": "hard",
    "first": "data",
    "second": "pipeline",
    "term": "data pipeline",
    "category": "AI",
    "definition": "Automated flow that moves and prepares data"
  },
  {
    "rank": 680,
    "difficulty": "hard",
    "first": "super",
    "second": "resolution",
    "term": "super resolution",
    "category": "AI",
    "definition": "AI technique that sharpens low-res images"
  },
  {
    "rank": 681,
    "difficulty": "hard",
    "first": "ui",
    "second": "generation",
    "term": "UI generation",
    "category": "AI",
    "definition": "AI creating interface layouts from prompts"
  },
  {
    "rank": 682,
    "difficulty": "hard",
    "first": "main",
    "second": "component",
    "term": "main component",
    "category": "Tools",
    "definition": "Original component that controls all its copies"
  },
  {
    "rank": 683,
    "difficulty": "hard",
    "first": "context",
    "second": "engineering",
    "term": "context engineering",
    "category": "AI",
    "definition": "Curating all the information an AI sees for a task"
  },
  {
    "rank": 684,
    "difficulty": "hard",
    "first": "source",
    "second": "citation",
    "term": "source citation",
    "category": "AI",
    "definition": "Link showing where AI got its information"
  },
  {
    "rank": 685,
    "difficulty": "hard",
    "first": "in",
    "second": "painting",
    "term": "inpainting",
    "category": "AI",
    "definition": "Regenerating a selected area of an image"
  },
  {
    "rank": 686,
    "difficulty": "hard",
    "first": "edge",
    "second": "detection",
    "term": "edge detection",
    "category": "AI",
    "definition": "Finding outlines of shapes in an image"
  },
  {
    "rank": 687,
    "difficulty": "hard",
    "first": "object",
    "second": "detection",
    "term": "object detection",
    "category": "AI",
    "definition": "AI finding and labeling objects in images"
  },
  {
    "rank": 688,
    "difficulty": "hard",
    "first": "knowledge",
    "second": "cutoff",
    "term": "knowledge cutoff",
    "category": "AI",
    "definition": "Date after which a model has no training data"
  },
  {
    "rank": 689,
    "difficulty": "hard",
    "first": "spring",
    "second": "animation",
    "term": "spring animation",
    "category": "Motion",
    "definition": "Physics-based motion with natural bounce"
  },
  {
    "rank": 690,
    "difficulty": "hard",
    "first": "design",
    "second": "rationale",
    "term": "design rationale",
    "category": "Workflow",
    "definition": "Explanation of why a design decision was made"
  },
  {
    "rank": 691,
    "difficulty": "hard",
    "first": "smart",
    "second": "compose",
    "term": "smart compose",
    "category": "AI",
    "definition": "AI predicting the rest of your sentence"
  },
  {
    "rank": 692,
    "difficulty": "hard",
    "first": "path",
    "second": "finder",
    "term": "pathfinder",
    "category": "Tools",
    "definition": "Panel for combining and cutting vector shapes"
  },
  {
    "rank": 693,
    "difficulty": "hard",
    "first": "optical",
    "second": "alignment",
    "term": "optical alignment",
    "category": "Layout",
    "definition": "Aligning by what looks right, not by math"
  },
  {
    "rank": 694,
    "difficulty": "hard",
    "first": "palette",
    "second": "generator",
    "term": "palette generator",
    "category": "AI",
    "definition": "Tool that creates color palettes automatically"
  },
  {
    "rank": 695,
    "difficulty": "hard",
    "first": "research",
    "second": "synthesis",
    "term": "research synthesis",
    "category": "AI",
    "definition": "Turning raw research into themes and insights"
  },
  {
    "rank": 696,
    "difficulty": "hard",
    "first": "speech",
    "second": "synthesis",
    "term": "speech synthesis",
    "category": "AI",
    "definition": "Generating spoken audio from text"
  },
  {
    "rank": 697,
    "difficulty": "hard",
    "first": "human",
    "second": "oversight",
    "term": "human oversight",
    "category": "AI",
    "definition": "People supervising and checking AI decisions"
  },
  {
    "rank": 698,
    "difficulty": "hard",
    "first": "data",
    "second": "labeling",
    "term": "data labeling",
    "category": "AI",
    "definition": "Tagging data so models can learn from it"
  },
  {
    "rank": 699,
    "difficulty": "hard",
    "first": "out",
    "second": "painting",
    "term": "outpainting",
    "category": "AI",
    "definition": "Extending an image beyond its original edges"
  },
  {
    "rank": 700,
    "difficulty": "hard",
    "first": "book",
    "second": "binding",
    "term": "bookbinding",
    "category": "Print",
    "definition": "Craft of assembling pages into a book"
  },
  {
    "rank": 701,
    "difficulty": "hard",
    "first": "progressive",
    "second": "disclosure",
    "term": "progressive disclosure",
    "category": "UX",
    "definition": "Revealing information gradually to reduce overwhelm"
  },
  {
    "rank": 702,
    "difficulty": "hard",
    "first": "ai",
    "second": "alignment",
    "term": "AI alignment",
    "category": "AI",
    "definition": "Making AI goals match human intentions"
  },
  {
    "rank": 703,
    "difficulty": "hard",
    "first": "inline",
    "second": "suggestion",
    "term": "inline suggestion",
    "category": "AI",
    "definition": "AI proposal shown directly in your text"
  },
  {
    "rank": 704,
    "difficulty": "hard",
    "first": "gradient",
    "second": "overlay",
    "term": "gradient overlay",
    "category": "Tools",
    "definition": "Gradient layered over an element as an effect"
  },
  {
    "rank": 705,
    "difficulty": "hard",
    "first": "paragraph",
    "second": "spacing",
    "term": "paragraph spacing",
    "category": "Typography",
    "definition": "Space added between paragraphs"
  },
  {
    "rank": 706,
    "difficulty": "hard",
    "first": "type",
    "second": "foundry",
    "term": "type foundry",
    "category": "Typography",
    "definition": "Company that designs and sells typefaces"
  },
  {
    "rank": 707,
    "difficulty": "hard",
    "first": "workflow",
    "second": "automation",
    "term": "workflow automation",
    "category": "AI",
    "definition": "Using software to run repetitive steps automatically"
  },
  {
    "rank": 708,
    "difficulty": "hard",
    "first": "spot",
    "second": "illustration",
    "term": "spot illustration",
    "category": "Brand",
    "definition": "Small standalone illustration accenting content"
  },
  {
    "rank": 709,
    "difficulty": "hard",
    "first": "prompt",
    "second": "caching",
    "term": "prompt caching",
    "category": "AI",
    "definition": "Reusing processed prompt parts to save time and cost"
  },
  {
    "rank": 710,
    "difficulty": "hard",
    "first": "pose",
    "second": "estimation",
    "term": "pose estimation",
    "category": "AI",
    "definition": "Detecting body joints and posture from images"
  },
  {
    "rank": 711,
    "difficulty": "hard",
    "first": "agentic",
    "second": "workflow",
    "term": "agentic workflow",
    "category": "AI",
    "definition": "Process where AI agents plan and execute steps"
  },
  {
    "rank": 712,
    "difficulty": "hard",
    "first": "prompt",
    "second": "chaining",
    "term": "prompt chaining",
    "category": "AI",
    "definition": "Feeding one prompt's output into the next"
  },
  {
    "rank": 713,
    "difficulty": "hard",
    "first": "image",
    "second": "segmentation",
    "term": "image segmentation",
    "category": "AI",
    "definition": "Dividing an image into labeled regions"
  },
  {
    "rank": 714,
    "difficulty": "hard",
    "first": "hit",
    "second": "area",
    "term": "hit area",
    "category": "UI",
    "definition": "Invisible clickable zone around an element"
  },
  {
    "rank": 715,
    "difficulty": "hard",
    "first": "leading",
    "second": "line",
    "term": "leading line",
    "category": "Layout",
    "definition": "Line guiding the eye toward a subject"
  },
  {
    "rank": 716,
    "difficulty": "hard",
    "first": "cold",
    "second": "start",
    "term": "cold start",
    "category": "AI",
    "definition": "Lack of data when a system first launches"
  },
  {
    "rank": 717,
    "difficulty": "hard",
    "first": "key",
    "second": "art",
    "term": "key art",
    "category": "Brand",
    "definition": "Main promotional image for a campaign or title"
  },
  {
    "rank": 718,
    "difficulty": "hard",
    "first": "clear",
    "second": "space",
    "term": "clear space",
    "category": "Brand",
    "definition": "Empty area required around a logo"
  },
  {
    "rank": 719,
    "difficulty": "hard",
    "first": "one",
    "second": "shot",
    "term": "one-shot",
    "category": "AI",
    "definition": "Giving AI exactly one example to follow"
  },
  {
    "rank": 720,
    "difficulty": "hard",
    "first": "few",
    "second": "shot",
    "term": "few-shot",
    "category": "AI",
    "definition": "Giving AI a few examples before the task"
  },
  {
    "rank": 721,
    "difficulty": "hard",
    "first": "tree",
    "second": "test",
    "term": "tree test",
    "category": "UX",
    "definition": "Test of how easily users find items in a menu structure"
  },
  {
    "rank": 722,
    "difficulty": "hard",
    "first": "character",
    "second": "set",
    "term": "character set",
    "category": "Typography",
    "definition": "All the glyphs a font includes"
  },
  {
    "rank": 723,
    "difficulty": "hard",
    "first": "multi",
    "second": "turn",
    "term": "multi-turn",
    "category": "AI",
    "definition": "Conversation spanning several back-and-forth messages"
  },
  {
    "rank": 724,
    "difficulty": "hard",
    "first": "rag",
    "second": "right",
    "term": "rag right",
    "category": "Typography",
    "definition": "Left-aligned text with an uneven right edge"
  },
  {
    "rank": 725,
    "difficulty": "hard",
    "first": "in",
    "second": "between",
    "term": "in-between",
    "category": "Motion",
    "definition": "Frames filling the motion between two keyframes"
  },
  {
    "rank": 726,
    "difficulty": "hard",
    "first": "diary",
    "second": "study",
    "term": "diary study",
    "category": "UX",
    "definition": "Participants log their experiences over days or weeks"
  },
  {
    "rank": 727,
    "difficulty": "hard",
    "first": "zero",
    "second": "shot",
    "term": "zero-shot",
    "category": "AI",
    "definition": "Asking AI to do a task with no examples"
  },
  {
    "rank": 728,
    "difficulty": "hard",
    "first": "base",
    "second": "model",
    "term": "base model",
    "category": "AI",
    "definition": "Pretrained model before fine-tuning"
  },
  {
    "rank": 729,
    "difficulty": "hard",
    "first": "learning",
    "second": "rate",
    "term": "learning rate",
    "category": "AI",
    "definition": "How big each training update step is"
  },
  {
    "rank": 730,
    "difficulty": "hard",
    "first": "card",
    "second": "sort",
    "term": "card sort",
    "category": "UX",
    "definition": "Research method where users group topics into categories"
  },
  {
    "rank": 731,
    "difficulty": "hard",
    "first": "black",
    "second": "box",
    "term": "black box",
    "category": "AI",
    "definition": "System whose inner workings can't be seen"
  },
  {
    "rank": 732,
    "difficulty": "hard",
    "first": "follow",
    "second": "through",
    "term": "follow through",
    "category": "Motion",
    "definition": "Parts continuing to move after the main action stops"
  },
  {
    "rank": 733,
    "difficulty": "hard",
    "first": "ground",
    "second": "truth",
    "term": "ground truth",
    "category": "AI",
    "definition": "Verified correct answers used to judge a model"
  },
  {
    "rank": 734,
    "difficulty": "hard",
    "first": "model",
    "second": "card",
    "term": "model card",
    "category": "AI",
    "definition": "Document explaining a model's abilities and limits"
  },
  {
    "rank": 735,
    "difficulty": "hard",
    "first": "tab",
    "second": "stop",
    "term": "tab stop",
    "category": "Typography",
    "definition": "Set position where text aligns after pressing tab"
  },
  {
    "rank": 736,
    "difficulty": "hard",
    "first": "rich",
    "second": "black",
    "term": "rich black",
    "category": "Print",
    "definition": "Deep black mixing several inks"
  },
  {
    "rank": 737,
    "difficulty": "hard",
    "first": "print",
    "second": "run",
    "term": "print run",
    "category": "Print",
    "definition": "Number of copies printed in one batch"
  },
  {
    "rank": 738,
    "difficulty": "hard",
    "first": "point",
    "second": "size",
    "term": "point size",
    "category": "Typography",
    "definition": "Font size measured in points"
  },
  {
    "rank": 739,
    "difficulty": "hard",
    "first": "display",
    "second": "type",
    "term": "display type",
    "category": "Typography",
    "definition": "Large text designed for headlines"
  },
  {
    "rank": 740,
    "difficulty": "hard",
    "first": "latent",
    "second": "space",
    "term": "latent space",
    "category": "AI",
    "definition": "Hidden map of concepts a model learns"
  },
  {
    "rank": 741,
    "difficulty": "hard",
    "first": "off",
    "second": "set",
    "term": "offset",
    "category": "Print",
    "definition": "Printing that transfers ink via a rubber blanket"
  },
  {
    "rank": 742,
    "difficulty": "hard",
    "first": "fold",
    "second": "line",
    "term": "fold line",
    "category": "Print",
    "definition": "Where a printed piece gets folded"
  },
  {
    "rank": 743,
    "difficulty": "hard",
    "first": "die",
    "second": "cut",
    "term": "die cut",
    "category": "Print",
    "definition": "Custom shape cut into paper with a blade"
  },
  {
    "rank": 744,
    "difficulty": "hard",
    "first": "guidance",
    "second": "scale",
    "term": "guidance scale",
    "category": "AI",
    "definition": "How strictly an image model follows the prompt"
  },
  {
    "rank": 745,
    "difficulty": "hard",
    "first": "secondary",
    "second": "action",
    "term": "secondary action",
    "category": "Motion",
    "definition": "Smaller motion supporting the main animated action"
  },
  {
    "rank": 746,
    "difficulty": "hard",
    "first": "aesthetic",
    "second": "score",
    "term": "aesthetic score",
    "category": "AI",
    "definition": "Rating predicting how visually pleasing an image is"
  },
  {
    "rank": 747,
    "difficulty": "hard",
    "first": "key",
    "second": "line",
    "term": "keyline",
    "category": "Layout",
    "definition": "Guide shape or line used to align elements"
  },
  {
    "rank": 748,
    "difficulty": "hard",
    "first": "bleed",
    "second": "line",
    "term": "bleed line",
    "category": "Print",
    "definition": "Outer edge where extended artwork gets cut off"
  },
  {
    "rank": 749,
    "difficulty": "hard",
    "first": "token",
    "second": "count",
    "term": "token count",
    "category": "AI",
    "definition": "Number of text chunks in a prompt or response"
  },
  {
    "rank": 750,
    "difficulty": "hard",
    "first": "optical",
    "second": "size",
    "term": "optical size",
    "category": "Typography",
    "definition": "Font design adjusted for small or large sizes"
  },
  {
    "rank": 751,
    "difficulty": "hard",
    "first": "parameter",
    "second": "count",
    "term": "parameter count",
    "category": "AI",
    "definition": "Number of learned values in a model"
  },
  {
    "rank": 752,
    "difficulty": "hard",
    "first": "onion",
    "second": "skin",
    "term": "onion skin",
    "category": "Motion",
    "definition": "Showing faint previous frames while animating"
  },
  {
    "rank": 753,
    "difficulty": "hard",
    "first": "compound",
    "second": "path",
    "term": "compound path",
    "category": "Tools",
    "definition": "Several paths merged into one object"
  },
  {
    "rank": 754,
    "difficulty": "hard",
    "first": "process",
    "second": "color",
    "term": "process color",
    "category": "Print",
    "definition": "Colors printed by mixing CMYK inks"
  },
  {
    "rank": 755,
    "difficulty": "hard",
    "first": "gradient",
    "second": "map",
    "term": "gradient map",
    "category": "Tools",
    "definition": "Maps image tones to colors along a gradient"
  },
  {
    "rank": 756,
    "difficulty": "hard",
    "first": "trim",
    "second": "size",
    "term": "trim size",
    "category": "Print",
    "definition": "Final dimensions of a printed piece after cutting"
  },
  {
    "rank": 757,
    "difficulty": "hard",
    "first": "crop",
    "second": "mark",
    "term": "crop mark",
    "category": "Print",
    "definition": "Lines showing where printed sheets get trimmed"
  },
  {
    "rank": 758,
    "difficulty": "hard",
    "first": "random",
    "second": "seed",
    "term": "random seed",
    "category": "AI",
    "definition": "Number that makes an AI result reproducible"
  },
  {
    "rank": 759,
    "difficulty": "hard",
    "first": "paste",
    "second": "board",
    "term": "pasteboard",
    "category": "Tools",
    "definition": "Workspace area surrounding the page or artboard"
  },
  {
    "rank": 760,
    "difficulty": "hard",
    "first": "clipping",
    "second": "path",
    "term": "clipping path",
    "category": "Tools",
    "definition": "Vector outline cutting out part of an image"
  },
  {
    "rank": 761,
    "difficulty": "hard",
    "first": "sampling",
    "second": "method",
    "term": "sampling method",
    "category": "AI",
    "definition": "Algorithm a diffusion model uses to generate"
  },
  {
    "rank": 762,
    "difficulty": "hard",
    "first": "mono",
    "second": "line",
    "term": "monoline",
    "category": "Typography",
    "definition": "Letterforms drawn with one consistent stroke width"
  },
  {
    "rank": 763,
    "difficulty": "hard",
    "first": "smart",
    "second": "object",
    "term": "smart object",
    "category": "Tools",
    "definition": "Layer that preserves original content for non-destructive edits"
  },
  {
    "rank": 764,
    "difficulty": "hard",
    "first": "dot",
    "second": "gain",
    "term": "dot gain",
    "category": "Print",
    "definition": "Ink dots spreading larger than intended when printed"
  },
  {
    "rank": 765,
    "difficulty": "hard",
    "first": "task",
    "second": "analysis",
    "term": "task analysis",
    "category": "UX",
    "definition": "Breaking down how users complete a task"
  },
  {
    "rank": 766,
    "difficulty": "hard",
    "first": "hallway",
    "second": "testing",
    "term": "hallway testing",
    "category": "UX",
    "definition": "Asking nearby colleagues to quickly try a design"
  },
  {
    "rank": 767,
    "difficulty": "hard",
    "first": "sprite",
    "second": "sheet",
    "term": "sprite sheet",
    "category": "Motion",
    "definition": "Single image containing many animation frames or icons"
  },
  {
    "rank": 768,
    "difficulty": "hard",
    "first": "old",
    "second": "style",
    "term": "oldstyle",
    "category": "Typography",
    "definition": "Numerals that rise and fall like lowercase letters"
  },
  {
    "rank": 769,
    "difficulty": "hard",
    "first": "loss",
    "second": "function",
    "term": "loss function",
    "category": "AI",
    "definition": "Measure of how wrong a model's predictions are"
  },
  {
    "rank": 770,
    "difficulty": "hard",
    "first": "over",
    "second": "shoot",
    "term": "overshoot",
    "category": "Typography",
    "definition": "Round letters extending slightly past baseline for balance"
  },
  {
    "rank": 771,
    "difficulty": "hard",
    "first": "ink",
    "second": "trap",
    "term": "ink trap",
    "category": "Typography",
    "definition": "Notch in letters preventing ink from blotting"
  },
  {
    "rank": 772,
    "difficulty": "hard",
    "first": "contact",
    "second": "sheet",
    "term": "contact sheet",
    "category": "Print",
    "definition": "Page of thumbnail images for review"
  },
  {
    "rank": 773,
    "difficulty": "hard",
    "first": "guerrilla",
    "second": "testing",
    "term": "guerrilla testing",
    "category": "UX",
    "definition": "Quick informal tests with people in public places"
  },
  {
    "rank": 774,
    "difficulty": "hard",
    "first": "cap",
    "second": "height",
    "term": "cap height",
    "category": "Typography",
    "definition": "Height of a typeface's capital letters"
  },
  {
    "rank": 775,
    "difficulty": "hard",
    "first": "algorithmic",
    "second": "bias",
    "term": "algorithmic bias",
    "category": "AI",
    "definition": "Unfair results caused by skewed data or design"
  },
  {
    "rank": 776,
    "difficulty": "hard",
    "first": "solid",
    "second": "drawing",
    "term": "solid drawing",
    "category": "Motion",
    "definition": "Giving drawings believable weight and volume"
  },
  {
    "rank": 777,
    "difficulty": "hard",
    "first": "faux",
    "second": "bold",
    "term": "faux bold",
    "category": "Typography",
    "definition": "Artificially thickened text when no bold exists"
  },
  {
    "rank": 778,
    "difficulty": "hard",
    "first": "lining",
    "second": "figures",
    "term": "lining figures",
    "category": "Typography",
    "definition": "Numerals all sitting at cap height"
  },
  {
    "rank": 779,
    "difficulty": "hard",
    "first": "em",
    "second": "dash",
    "term": "em dash",
    "category": "Typography",
    "definition": "Long dash used to break or add thoughts"
  },
  {
    "rank": 780,
    "difficulty": "hard",
    "first": "en",
    "second": "dash",
    "term": "en dash",
    "category": "Typography",
    "definition": "Medium dash used for ranges like 2–5"
  },
  {
    "rank": 781,
    "difficulty": "hard",
    "first": "control",
    "second": "net",
    "term": "ControlNet",
    "category": "AI",
    "definition": "Method guiding image AI with poses, edges, or depth"
  },
  {
    "rank": 782,
    "difficulty": "hard",
    "first": "gradient",
    "second": "mesh",
    "term": "gradient mesh",
    "category": "Tools",
    "definition": "Grid of color points creating complex smooth blends"
  },
  {
    "rank": 783,
    "difficulty": "hard",
    "first": "black",
    "second": "letter",
    "term": "blackletter",
    "category": "Typography",
    "definition": "Dense, gothic style of medieval lettering"
  },
  {
    "rank": 784,
    "difficulty": "hard",
    "first": "over",
    "second": "print",
    "term": "overprint",
    "category": "Print",
    "definition": "Printing one ink directly on top of another"
  },
  {
    "rank": 785,
    "difficulty": "hard",
    "first": "half",
    "second": "tone",
    "term": "halftone",
    "category": "Print",
    "definition": "Dots of varying size simulating continuous tone"
  },
  {
    "rank": 786,
    "difficulty": "hard",
    "first": "vector",
    "second": "database",
    "term": "vector database",
    "category": "AI",
    "definition": "Database storing embeddings for similarity search"
  },
  {
    "rank": 787,
    "difficulty": "hard",
    "first": "design",
    "second": "ops",
    "term": "DesignOps",
    "category": "Workflow",
    "definition": "Managing the tools and processes of design teams"
  },
  {
    "rank": 788,
    "difficulty": "hard",
    "first": "model",
    "second": "collapse",
    "term": "model collapse",
    "category": "AI",
    "definition": "Quality decay from training AI on AI output"
  },
  {
    "rank": 789,
    "difficulty": "hard",
    "first": "tabular",
    "second": "figures",
    "term": "tabular figures",
    "category": "Typography",
    "definition": "Equal-width numerals that line up in tables"
  },
  {
    "rank": 790,
    "difficulty": "hard",
    "first": "mode",
    "second": "collapse",
    "term": "mode collapse",
    "category": "AI",
    "definition": "Generator producing the same few outputs repeatedly"
  },
  {
    "rank": 791,
    "difficulty": "hard",
    "first": "open",
    "second": "weights",
    "term": "open weights",
    "category": "AI",
    "definition": "Model whose trained parameters are publicly downloadable"
  },
  {
    "rank": 792,
    "difficulty": "hard",
    "first": "model",
    "second": "weights",
    "term": "model weights",
    "category": "AI",
    "definition": "Learned numbers that define how a model behaves"
  },
  {
    "rank": 793,
    "difficulty": "hard",
    "first": "denoising",
    "second": "strength",
    "term": "denoising strength",
    "category": "AI",
    "definition": "How much AI changes an input image"
  },
  {
    "rank": 794,
    "difficulty": "hard",
    "first": "stroke",
    "second": "contrast",
    "term": "stroke contrast",
    "category": "Typography",
    "definition": "Difference between thick and thin strokes in letters"
  },
  {
    "rank": 795,
    "difficulty": "hard",
    "first": "lean",
    "second": "ux",
    "term": "Lean UX",
    "category": "UX",
    "definition": "Fast, experiment-driven approach to UX design"
  },
  {
    "rank": 796,
    "difficulty": "hard",
    "first": "ink",
    "second": "coverage",
    "term": "ink coverage",
    "category": "Print",
    "definition": "Total amount of ink laid on paper"
  },
  {
    "rank": 797,
    "difficulty": "hard",
    "first": "grain",
    "second": "direction",
    "term": "grain direction",
    "category": "Print",
    "definition": "Direction paper fibers run, affecting folds"
  },
  {
    "rank": 798,
    "difficulty": "hard",
    "first": "ball",
    "second": "terminal",
    "term": "ball terminal",
    "category": "Typography",
    "definition": "Round, ball-shaped end on some letter strokes"
  },
  {
    "rank": 799,
    "difficulty": "hard",
    "first": "attention",
    "second": "mechanism",
    "term": "attention mechanism",
    "category": "AI",
    "definition": "How a model decides which inputs matter most"
  },
  {
    "rank": 800,
    "difficulty": "hard",
    "first": "perfect",
    "second": "binding",
    "term": "perfect binding",
    "category": "Print",
    "definition": "Glued spine binding used for paperbacks"
  },
  {
    "rank": 801,
    "difficulty": "hard",
    "first": "over",
    "second": "fitting",
    "term": "overfitting",
    "category": "AI",
    "definition": "Model memorizes training data and fails on new data"
  },
  {
    "rank": 802,
    "difficulty": "hard",
    "first": "saddle",
    "second": "stitch",
    "term": "saddle stitch",
    "category": "Print",
    "definition": "Binding with staples through the folded spine"
  },
  {
    "rank": 803,
    "difficulty": "hard",
    "first": "red",
    "second": "teaming",
    "term": "red teaming",
    "category": "AI",
    "definition": "Deliberately attacking a system to find weaknesses"
  },
  {
    "rank": 804,
    "difficulty": "hard",
    "first": "data",
    "second": "poisoning",
    "term": "data poisoning",
    "category": "AI",
    "definition": "Corrupting training data to manipulate a model"
  },
  {
    "rank": 805,
    "difficulty": "hard",
    "first": "under",
    "second": "fitting",
    "term": "underfitting",
    "category": "AI",
    "definition": "Model too simple to capture the pattern"
  },
  {
    "rank": 806,
    "difficulty": "hard",
    "first": "golden",
    "second": "dataset",
    "term": "golden dataset",
    "category": "AI",
    "definition": "Trusted reference examples used to evaluate AI"
  },
  {
    "rank": 807,
    "difficulty": "hard",
    "first": "service",
    "second": "blueprint",
    "term": "service blueprint",
    "category": "UX",
    "definition": "Map of a service's front and backstage processes"
  },
  {
    "rank": 808,
    "difficulty": "hard",
    "first": "color",
    "second": "separation",
    "term": "color separation",
    "category": "Print",
    "definition": "Splitting artwork into ink plates for printing"
  },
  {
    "rank": 809,
    "difficulty": "hard",
    "first": "transformer",
    "second": "architecture",
    "term": "transformer architecture",
    "category": "AI",
    "definition": "Model design behind most modern language AI"
  },
  {
    "rank": 810,
    "difficulty": "hard",
    "first": "bike",
    "second": "shedding",
    "term": "bikeshedding",
    "category": "Workflow",
    "definition": "Debating trivial details while ignoring bigger issues"
  },
  {
    "rank": 811,
    "difficulty": "hard",
    "first": "true",
    "second": "italic",
    "term": "true italic",
    "category": "Typography",
    "definition": "Specially drawn italic letters, not slanted roman"
  },
  {
    "rank": 812,
    "difficulty": "hard",
    "first": "content",
    "second": "credentials",
    "term": "content credentials",
    "category": "AI",
    "definition": "Metadata showing how media was made or edited"
  },
  {
    "rank": 813,
    "difficulty": "hard",
    "first": "spot",
    "second": "varnish",
    "term": "spot varnish",
    "category": "Print",
    "definition": "Glossy coating applied to selected areas"
  },
  {
    "rank": 814,
    "difficulty": "hard",
    "first": "word",
    "second": "embedding",
    "term": "word embedding",
    "category": "AI",
    "definition": "Numeric representation capturing a word's meaning"
  },
  {
    "rank": 815,
    "difficulty": "hard",
    "first": "image",
    "second": "embedding",
    "term": "image embedding",
    "category": "AI",
    "definition": "Numeric representation capturing an image's content"
  },
  {
    "rank": 816,
    "difficulty": "hard",
    "first": "hanging",
    "second": "indent",
    "term": "hanging indent",
    "category": "Typography",
    "definition": "First line flush left, later lines indented"
  },
  {
    "rank": 817,
    "difficulty": "hard",
    "first": "hanging",
    "second": "punctuation",
    "term": "hanging punctuation",
    "category": "Typography",
    "definition": "Punctuation placed outside the text margin for alignment"
  },
  {
    "rank": 818,
    "difficulty": "hard",
    "first": "optical",
    "second": "kerning",
    "term": "optical kerning",
    "category": "Typography",
    "definition": "Spacing letters based on their shapes"
  },
  {
    "rank": 819,
    "difficulty": "hard",
    "first": "blind",
    "second": "emboss",
    "term": "blind emboss",
    "category": "Print",
    "definition": "Raised design without any ink or foil"
  },
  {
    "rank": 820,
    "difficulty": "hard",
    "first": "dog",
    "second": "fooding",
    "term": "dogfooding",
    "category": "Workflow",
    "definition": "Using your own product to find problems"
  },
  {
    "rank": 821,
    "difficulty": "hard",
    "first": "frame",
    "second": "interpolation",
    "term": "frame interpolation",
    "category": "AI",
    "definition": "AI creating in-between frames for smoother video"
  },
  {
    "rank": 822,
    "difficulty": "easy",
    "first": "map",
    "second": "pin",
    "term": "map pin",
    "category": "UI",
    "definition": "Marker icon showing a location on a map"
  },
  {
    "rank": 823,
    "difficulty": "easy",
    "first": "up",
    "second": "vote",
    "term": "upvote",
    "category": "UI",
    "definition": "Mark content as liked or approved with a single tap"
  },
  {
    "rank": 824,
    "difficulty": "moderate",
    "first": "space",
    "second": "gray",
    "term": "space gray",
    "category": "Color",
    "definition": "Dark neutral gray popularized by Apple's product design"
  },
  {
    "rank": 825,
    "difficulty": "moderate",
    "first": "state",
    "second": "machine",
    "term": "state machine",
    "category": "UX",
    "definition": "Model defining a component's possible states and transitions"
  },
  {
    "rank": 826,
    "difficulty": "moderate",
    "first": "testing",
    "second": "framework",
    "term": "testing framework",
    "category": "Tools",
    "definition": "Structured set of tools and conventions for running tests"
  },
  {
    "rank": 827,
    "difficulty": "easy",
    "first": "mode",
    "second": "toggle",
    "term": "mode toggle",
    "category": "UI",
    "definition": "Control for switching between two interface modes, like light and dark"
  },
  {
    "rank": 828,
    "difficulty": "hard",
    "first": "chart",
    "second": "junk",
    "term": "chart junk",
    "category": "UX",
    "definition": "Unnecessary decoration in a chart that doesn't aid understanding"
  },
  {
    "rank": 829,
    "difficulty": "moderate",
    "first": "set",
    "second": "design",
    "term": "set design",
    "category": "Motion",
    "definition": "Designing the physical or virtual environment for a scene"
  },
  {
    "rank": 830,
    "difficulty": "easy",
    "first": "review",
    "second": "cycle",
    "term": "review cycle",
    "category": "Workflow",
    "definition": "Repeating process of sharing work and gathering feedback"
  },
  {
    "rank": 831,
    "difficulty": "moderate",
    "first": "rate",
    "second": "card",
    "term": "rate card",
    "category": "Brand",
    "definition": "Document listing standard prices for services or ad space"
  },
  {
    "rank": 832,
    "difficulty": "moderate",
    "first": "library",
    "second": "update",
    "term": "library update",
    "category": "Tools",
    "definition": "Notification that a shared design library has new changes"
  },
  {
    "rank": 833,
    "difficulty": "hard",
    "first": "shadow",
    "second": "dom",
    "term": "shadow DOM",
    "category": "Tools",
    "definition": "Encapsulated DOM subtree used by web components"
  },
  {
    "rank": 834,
    "difficulty": "easy",
    "first": "message",
    "second": "bubble",
    "term": "message bubble",
    "category": "UI",
    "definition": "Rounded container displaying a single chat message"
  },
  {
    "rank": 835,
    "difficulty": "moderate",
    "first": "scale",
    "second": "factor",
    "term": "scale factor",
    "category": "Layout",
    "definition": "Multiplier used to resize an element proportionally"
  },
  {
    "rank": 836,
    "difficulty": "moderate",
    "first": "weight",
    "second": "distribution",
    "term": "weight distribution",
    "category": "Layout",
    "definition": "How visual weight is spread across a composition"
  },
  {
    "rank": 837,
    "difficulty": "easy",
    "first": "group",
    "second": "chat",
    "term": "group chat",
    "category": "UI",
    "definition": "Conversation thread between more than two people"
  },
  {
    "rank": 838,
    "difficulty": "easy",
    "first": "area",
    "second": "chart",
    "term": "area chart",
    "category": "Layout",
    "definition": "Chart showing quantities as filled regions over an axis"
  },
  {
    "rank": 839,
    "difficulty": "moderate",
    "first": "link",
    "second": "rot",
    "term": "link rot",
    "category": "UX",
    "definition": "Gradual breaking of links as linked pages disappear over time"
  },
  {
    "rank": 840,
    "difficulty": "moderate",
    "first": "writing",
    "second": "system",
    "term": "writing system",
    "category": "Typography",
    "definition": "Set of symbols used to represent a language in text"
  },
  {
    "rank": 841,
    "difficulty": "moderate",
    "first": "identity",
    "second": "system",
    "term": "identity system",
    "category": "Brand",
    "definition": "Full set of visual elements that define a brand's identity"
  },
  {
    "rank": 842,
    "difficulty": "easy",
    "first": "caps",
    "second": "lock",
    "term": "caps lock",
    "category": "Typography",
    "definition": "Keyboard key that types in all capital letters"
  },
  {
    "rank": 843,
    "difficulty": "moderate",
    "first": "palette",
    "second": "swap",
    "term": "palette swap",
    "category": "Color",
    "definition": "Reusing an existing design with a different color palette"
  },
  {
    "rank": 844,
    "difficulty": "easy",
    "first": "press",
    "second": "kit",
    "term": "press kit",
    "category": "Brand",
    "definition": "Bundle of materials prepared for media coverage"
  },
  {
    "rank": 845,
    "difficulty": "easy",
    "first": "end",
    "second": "user",
    "term": "end user",
    "category": "UX",
    "definition": "The person who ultimately uses a product"
  },
  {
    "rank": 846,
    "difficulty": "easy",
    "first": "order",
    "second": "confirmation",
    "term": "order confirmation",
    "category": "UX",
    "definition": "Message confirming a completed purchase"
  },
  {
    "rank": 847,
    "difficulty": "easy",
    "first": "load",
    "second": "time",
    "term": "load time",
    "category": "UX",
    "definition": "How long a page or app takes to become usable"
  },
  {
    "rank": 848,
    "difficulty": "moderate",
    "first": "test",
    "second": "case",
    "term": "test case",
    "category": "Workflow",
    "definition": "A specific scenario used to verify something works correctly"
  },
  {
    "rank": 849,
    "difficulty": "hard",
    "first": "cut",
    "second": "line",
    "term": "cutline",
    "category": "Print",
    "definition": "Caption printed beneath a photograph or illustration"
  },
  {
    "rank": 850,
    "difficulty": "moderate",
    "first": "audit",
    "second": "trail",
    "term": "audit trail",
    "category": "UX",
    "definition": "Chronological record of changes made to a system"
  },
  {
    "rank": 851,
    "difficulty": "hard",
    "first": "through",
    "second": "put",
    "term": "throughput",
    "category": "Tools",
    "definition": "Amount of work a system completes in a given time"
  },
  {
    "rank": 852,
    "difficulty": "easy",
    "first": "quote",
    "second": "card",
    "term": "quote card",
    "category": "Brand",
    "definition": "Graphic featuring a short quote, often shared on social media"
  },
  {
    "rank": 853,
    "difficulty": "moderate",
    "first": "format",
    "second": "painter",
    "term": "format painter",
    "category": "Tools",
    "definition": "Tool that copies formatting from one element to another"
  },
  {
    "rank": 854,
    "difficulty": "moderate",
    "first": "texture",
    "second": "map",
    "term": "texture map",
    "category": "Tools",
    "definition": "Image applied to a 3D surface to simulate detail"
  },
  {
    "rank": 855,
    "difficulty": "moderate",
    "first": "tracking",
    "second": "pixel",
    "term": "tracking pixel",
    "category": "Tools",
    "definition": "Tiny invisible image used to monitor user behavior"
  },
  {
    "rank": 856,
    "difficulty": "hard",
    "first": "resolution",
    "second": "independence",
    "term": "resolution independence",
    "category": "Tools",
    "definition": "Ability of graphics to scale cleanly across screen resolutions"
  },
  {
    "rank": 857,
    "difficulty": "moderate",
    "first": "overlay",
    "second": "grid",
    "term": "overlay grid",
    "category": "Layout",
    "definition": "Grid placed on top of a design to check alignment"
  },
  {
    "rank": 858,
    "difficulty": "hard",
    "first": "binding",
    "second": "edge",
    "term": "binding edge",
    "category": "Print",
    "definition": "The edge of a printed piece where pages are bound together"
  },
  {
    "rank": 859,
    "difficulty": "moderate",
    "first": "research",
    "second": "question",
    "term": "research question",
    "category": "UX",
    "definition": "The specific question a research study aims to answer"
  },
  {
    "rank": 860,
    "difficulty": "moderate",
    "first": "interview",
    "second": "guide",
    "term": "interview guide",
    "category": "UX",
    "definition": "Prepared script of questions for a user interview"
  },
  {
    "rank": 861,
    "difficulty": "moderate",
    "first": "interface",
    "second": "guidelines",
    "term": "interface guidelines",
    "category": "UI",
    "definition": "A company's official rules for designing consistent interfaces"
  },
  {
    "rank": 862,
    "difficulty": "easy",
    "first": "first",
    "second": "impression",
    "term": "first impression",
    "category": "UX",
    "definition": "A user's immediate reaction to a design"
  },
  {
    "rank": 863,
    "difficulty": "easy",
    "first": "star",
    "second": "rating",
    "term": "star rating",
    "category": "UI",
    "definition": "Score shown as a row of filled and empty stars"
  },
  {
    "rank": 864,
    "difficulty": "moderate",
    "first": "voice",
    "second": "talent",
    "term": "voice talent",
    "category": "Brand",
    "definition": "A professional hired to record spoken audio for a brand"
  },
  {
    "rank": 865,
    "difficulty": "easy",
    "first": "project",
    "second": "scope",
    "term": "project scope",
    "category": "Workflow",
    "definition": "The boundaries of what a project will and won't include"
  },
  {
    "rank": 866,
    "difficulty": "hard",
    "first": "model",
    "second": "sheet",
    "term": "model sheet",
    "category": "Print",
    "definition": "Reference sheet showing a character from multiple angles"
  },
  {
    "rank": 867,
    "difficulty": "hard",
    "first": "picture",
    "second": "plane",
    "term": "picture plane",
    "category": "Layout",
    "definition": "The flat surface on which a two-dimensional image is composed"
  },
  {
    "rank": 868,
    "difficulty": "easy",
    "first": "level",
    "second": "up",
    "term": "level up",
    "category": "UX",
    "definition": "Advancing to a higher stage, often with a reward"
  },
  {
    "rank": 869,
    "difficulty": "easy",
    "first": "target",
    "second": "market",
    "term": "target market",
    "category": "Brand",
    "definition": "The specific group of consumers a product is designed for"
  },
  {
    "rank": 870,
    "difficulty": "easy",
    "first": "ring",
    "second": "light",
    "term": "ring light",
    "category": "Tools",
    "definition": "Circular light used to evenly illuminate a subject for photo or video"
  },
  {
    "rank": 871,
    "difficulty": "easy",
    "first": "section",
    "second": "break",
    "term": "section break",
    "category": "Layout",
    "definition": "A divider marking the transition between sections of content"
  },
  {
    "rank": 872,
    "difficulty": "easy",
    "first": "ad",
    "second": "blocker",
    "term": "ad blocker",
    "category": "Tools",
    "definition": "Software that hides or prevents advertisements from loading"
  },
  {
    "rank": 873,
    "difficulty": "easy",
    "first": "code",
    "second": "review",
    "term": "code review",
    "category": "Tools",
    "definition": "Examining code changes before they are merged"
  },
  {
    "rank": 874,
    "difficulty": "moderate",
    "first": "tap",
    "second": "target",
    "term": "tap target",
    "category": "UI",
    "definition": "The touchable area around an interface element"
  },
  {
    "rank": 875,
    "difficulty": "easy",
    "first": "loop",
    "second": "animation",
    "term": "loop animation",
    "category": "Motion",
    "definition": "An animation that repeats seamlessly"
  },
  {
    "rank": 876,
    "difficulty": "moderate",
    "first": "history",
    "second": "panel",
    "term": "history panel",
    "category": "Tools",
    "definition": "A panel listing previous edit steps for undo and redo"
  },
  {
    "rank": 877,
    "difficulty": "moderate",
    "first": "session",
    "second": "recording",
    "term": "session recording",
    "category": "UX",
    "definition": "A recorded playback of a real user's session"
  },
  {
    "rank": 878,
    "difficulty": "easy",
    "first": "snap",
    "second": "shot",
    "term": "snapshot",
    "category": "Tools",
    "definition": "A saved copy of something's state at one moment in time"
  },
  {
    "rank": 879,
    "difficulty": "easy",
    "first": "shift",
    "second": "key",
    "term": "shift key",
    "category": "Typography",
    "definition": "Keyboard key used to type capital letters and symbols"
  },
  {
    "rank": 880,
    "difficulty": "easy",
    "first": "wall",
    "second": "paper",
    "term": "wallpaper",
    "category": "UI",
    "definition": "Background image displayed behind icons and windows"
  },
  {
    "rank": 881,
    "difficulty": "moderate",
    "first": "depth",
    "second": "perception",
    "term": "depth perception",
    "category": "Motion",
    "definition": "The visual ability to judge relative distances between objects"
  },
  {
    "rank": 882,
    "difficulty": "easy",
    "first": "read",
    "second": "ability",
    "term": "readability",
    "category": "Typography",
    "definition": "How easily text can be read and understood"
  },
  {
    "rank": 883,
    "difficulty": "hard",
    "first": "planning",
    "second": "poker",
    "term": "planning poker",
    "category": "Workflow",
    "definition": "Agile technique for estimating effort using playing cards"
  },
  {
    "rank": 884,
    "difficulty": "easy",
    "first": "profile",
    "second": "picture",
    "term": "profile picture",
    "category": "UI",
    "definition": "Small image representing a user across a product"
  },
  {
    "rank": 885,
    "difficulty": "easy",
    "first": "reader",
    "second": "mode",
    "term": "reader mode",
    "category": "UX",
    "definition": "Browser view that strips away clutter to show just the content"
  },
  {
    "rank": 886,
    "difficulty": "easy",
    "first": "spec",
    "second": "sheet",
    "term": "spec sheet",
    "category": "Workflow",
    "definition": "Document listing a design's exact measurements and details"
  },
  {
    "rank": 887,
    "difficulty": "easy",
    "first": "property",
    "second": "panel",
    "term": "property panel",
    "category": "Tools",
    "definition": "Panel showing editable attributes of a selected element"
  },
  {
    "rank": 888,
    "difficulty": "moderate",
    "first": "header",
    "second": "tag",
    "term": "header tag",
    "category": "Typography",
    "definition": "HTML element marking a heading's level and hierarchy"
  },
  {
    "rank": 889,
    "difficulty": "moderate",
    "first": "gesture",
    "second": "navigation",
    "term": "gesture navigation",
    "category": "UX",
    "definition": "Controlling an interface with swipes and touch gestures instead of buttons"
  },
  {
    "rank": 890,
    "difficulty": "moderate",
    "first": "blur",
    "second": "radius",
    "term": "blur radius",
    "category": "Tools",
    "definition": "Setting controlling how soft a blur effect appears"
  },
  {
    "rank": 891,
    "difficulty": "easy",
    "first": "settings",
    "second": "panel",
    "term": "settings panel",
    "category": "UI",
    "definition": "Screen or panel where a user adjusts preferences"
  },
  {
    "rank": 892,
    "difficulty": "easy",
    "first": "refresh",
    "second": "rate",
    "term": "refresh rate",
    "category": "Motion",
    "definition": "How many times per second a display updates its image"
  },
  {
    "rank": 893,
    "difficulty": "moderate",
    "first": "transition",
    "second": "curve",
    "term": "transition curve",
    "category": "Motion",
    "definition": "The easing curve controlling how a transition speeds up and slows down"
  },
  {
    "rank": 894,
    "difficulty": "easy",
    "first": "prototype",
    "second": "testing",
    "term": "prototype testing",
    "category": "UX",
    "definition": "Gathering feedback by having users try an early prototype"
  },
  {
    "rank": 895,
    "difficulty": "moderate",
    "first": "swatch",
    "second": "book",
    "term": "swatch book",
    "category": "Print",
    "definition": "A bound collection of color or material samples"
  },
  {
    "rank": 896,
    "difficulty": "moderate",
    "first": "stack",
    "second": "order",
    "term": "stack order",
    "category": "Layout",
    "definition": "The front-to-back arrangement of overlapping elements"
  },
  {
    "rank": 897,
    "difficulty": "easy",
    "first": "drawing",
    "second": "board",
    "term": "drawing board",
    "category": "Tools",
    "definition": "A flat surface used for drafting and sketching designs"
  },
  {
    "rank": 898,
    "difficulty": "moderate",
    "first": "mesh",
    "second": "gradient",
    "term": "mesh gradient",
    "category": "Color",
    "definition": "A gradient that blends multiple colors across a flexible mesh"
  },
  {
    "rank": 899,
    "difficulty": "easy",
    "first": "skin",
    "second": "tone",
    "term": "skin tone",
    "category": "Color",
    "definition": "The range of colors used to represent human skin"
  },
  {
    "rank": 900,
    "difficulty": "easy",
    "first": "sort",
    "second": "order",
    "term": "sort order",
    "category": "UI",
    "definition": "The sequence in which a list of items is arranged"
  },
  {
    "rank": 901,
    "difficulty": "hard",
    "first": "kerning",
    "second": "pair",
    "term": "kerning pair",
    "category": "Typography",
    "definition": "Two letters whose spacing is adjusted together"
  },
  {
    "rank": 902,
    "difficulty": "easy",
    "first": "size",
    "second": "chart",
    "term": "size chart",
    "category": "Workflow",
    "definition": "A chart showing product measurements across different sizes"
  },
  {
    "rank": 903,
    "difficulty": "moderate",
    "first": "liquid",
    "second": "glass",
    "term": "liquid glass",
    "category": "UI",
    "definition": "Apple's translucent, light-bending interface material introduced in 2025."
  },
  {
    "rank": 904,
    "difficulty": "moderate",
    "first": "container",
    "second": "query",
    "term": "container query",
    "category": "Layout",
    "definition": "CSS rule that styles a component based on the size of its parent instead of the screen."
  },
  {
    "rank": 905,
    "difficulty": "moderate",
    "first": "view",
    "second": "transition",
    "term": "view transition",
    "category": "Motion",
    "definition": "Browser feature that animates smoothly between two page or interface states."
  },
  {
    "rank": 906,
    "difficulty": "moderate",
    "first": "spatial",
    "second": "design",
    "term": "spatial design",
    "category": "UX",
    "definition": "Crafting interfaces that live in three-dimensional space around the user."
  },
  {
    "rank": 907,
    "difficulty": "hard",
    "first": "shader",
    "second": "fill",
    "term": "shader fill",
    "category": "Tools",
    "definition": "Paint type that colors a shape with a small GPU program for effects like noise or glow."
  },
  {
    "rank": 908,
    "difficulty": "hard",
    "first": "code",
    "second": "layer",
    "term": "code layer",
    "category": "Tools",
    "definition": "Canvas object backed by real code, whose edits sync back to the codebase."
  },
  {
    "rank": 909,
    "difficulty": "moderate",
    "first": "motion",
    "second": "timeline",
    "term": "motion timeline",
    "category": "Motion",
    "definition": "Track of keyframes arranged over time to choreograph an animation."
  },
  {
    "rank": 910,
    "difficulty": "moderate",
    "first": "shape",
    "second": "morphing",
    "term": "shape morphing",
    "category": "Motion",
    "definition": "Smooth transformation of one outline into another, used in Material 3 Expressive."
  },
  {
    "rank": 911,
    "difficulty": "moderate",
    "first": "floating",
    "second": "toolbar",
    "term": "floating toolbar",
    "category": "UI",
    "definition": "Compact bar of actions that hovers above the content it edits."
  },
  {
    "rank": 912,
    "difficulty": "easy",
    "first": "loading",
    "second": "indicator",
    "term": "loading indicator",
    "category": "UI",
    "definition": "Animation that tells people content is on its way."
  },
  {
    "rank": 913,
    "difficulty": "hard",
    "first": "scroll",
    "second": "timeline",
    "term": "scroll timeline",
    "category": "Motion",
    "definition": "Animation clock driven by scroll position instead of elapsed time."
  },
  {
    "rank": 914,
    "difficulty": "hard",
    "first": "anchor",
    "second": "positioning",
    "term": "anchor positioning",
    "category": "Layout",
    "definition": "CSS technique that places a popover or tooltip relative to another element."
  },
  {
    "rank": 915,
    "difficulty": "hard",
    "first": "cascade",
    "second": "layer",
    "term": "cascade layer",
    "category": "Tools",
    "definition": "CSS feature that groups rules into ordered tiers to control which styles win."
  },
  {
    "rank": 916,
    "difficulty": "moderate",
    "first": "design",
    "second": "engineer",
    "term": "design engineer",
    "category": "Workflow",
    "definition": "Hybrid role that designs interfaces and also builds them in code."
  },
  {
    "rank": 917,
    "difficulty": "hard",
    "first": "multimodal",
    "second": "interface",
    "term": "multimodal interface",
    "category": "UX",
    "definition": "System that accepts several kinds of input, such as touch, voice and gaze."
  },
  {
    "rank": 918,
    "difficulty": "hard",
    "first": "wide",
    "second": "gamut",
    "term": "wide gamut",
    "category": "Color",
    "definition": "Color range broader than sRGB, as shown by Display P3 screens."
  },
  {
    "rank": 919,
    "difficulty": "moderate",
    "first": "state",
    "second": "layer",
    "term": "state layer",
    "category": "UI",
    "definition": "Translucent overlay that shows hover, focus or press on a component."
  },
  {
    "rank": 920,
    "difficulty": "moderate",
    "first": "dynamic",
    "second": "color",
    "term": "dynamic color",
    "category": "Color",
    "definition": "Palette that adapts itself from a wallpaper or a single seed hue, popularized by Material You."
  }
];

const TIER_ORDER = ["easy", "moderate", "hard"];

// Chain graph: { "wire": [termObj, ...], ... }
const CHAIN = DESIGN_TERMS.reduce((g, t) => { (g[t.first] ||= []).push(t); return g; }, {});
const CONTINUABLE = new Set(Object.keys(CHAIN));

// Difficulty weights by round number (round = correct answers so far + 1)
function tierWeights(round) {
  if (round <= 3)  return { easy: 1,   moderate: 0,   hard: 0   };
  if (round <= 6)  return { easy: 0,   moderate: 0.7, hard: 0.3 };
  if (round <= 10) return { easy: 0,   moderate: 0.4, hard: 0.6 };
  return                  { easy: 0,   moderate: 0.2, hard: 0.8 };
}

// Pick the target tier for this round using the weights
function pickTier(round) {
  const w = tierWeights(round);
  let r = Math.random();
  for (const tier of TIER_ORDER) { if ((r -= w[tier]) < 0) return tier; }
  return "hard";
}

// Fallback order when the wanted tier isn't available from the current word
function fallbackTiers(tier) {
  return { easy: ["easy", "moderate", "hard"],
           moderate: ["moderate", "hard", "easy"],
           hard: ["hard", "moderate", "easy"] }[tier];
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Start a fresh chain with a term of the given tier (prefers terms that can continue)
function startTerm(tier, used = new Set()) {
  for (const t of fallbackTiers(tier)) {
    const pool = DESIGN_TERMS.filter(x => x.difficulty === t && !used.has(x.term));
    const alive = pool.filter(x => CONTINUABLE.has(x.second));
    if (alive.length) return { ...pick(alive), newChain: true };
    if (pool.length) return { ...pick(pool), newChain: true };
  }
  return { ...pick(DESIGN_TERMS), newChain: true }; // everything used: allow repeats
}

/**
 * Get the term for the next round.
 * mainWord: current main word (null at game start)
 * round:    1-based round number
 * used:     Set of term strings already played this game
 * After round 6, easy terms never appear; a new chain starts instead.
 * Returns a term object. If `newChain` is true, show `first` as the new main word
 * (with a "New chain!" message) because the current word couldn't continue at this difficulty.
 */
function getNextRound(mainWord, round, used = new Set()) {
  const tier = pickTier(round);
  if (!mainWord) return startTerm(tier, used);
  const options = (CHAIN[mainWord] || []).filter(t => !used.has(t.term));
  // Rounds 1–3: stay strictly easy, even if that means starting a new chain
  const tiers = round <= 3 ? ["easy"]
    : round <= 6 ? fallbackTiers(tier)
    : fallbackTiers(tier).filter(t => t !== "easy"); // after round 6, never drop back to easy
  for (const t of tiers) {
    const inTier = options.filter(o => o.difficulty === t);
    const alive = inTier.filter(o => CONTINUABLE.has(o.second));
    if (alive.length) return pick(alive);
    if (inTier.length) return pick(inTier);
  }
  return startTerm(tier, used);
}

// Check a guess against the current round's target term (case/space-insensitive).
// Accepts any valid term from the same main word with the same first letter and length.
function checkGuess(target, guess) {
  const g = guess.toLowerCase().replace(/[\s-]+/g, "");
  return (CHAIN[target.first] || []).find(t =>
    t.second === g && t.second[0] === target.second[0] && t.second.length === target.second.length
  ) || null;
}

if (typeof module !== "undefined") module.exports = { DESIGN_TERMS, CHAIN, getNextRound, startTerm, checkGuess, tierWeights };
