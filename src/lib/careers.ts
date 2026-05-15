// Curated career catalog with roadmaps, projects, and YouTube resources.
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type RoadmapStep = {
  key: string;
  title: string;
  level: Difficulty;
  hours: number;
  description: string;
  resources: { title: string; creator: string; duration: string; level: Difficulty; url: string }[];
};
export type Project = { title: string; level: Difficulty; tech: string[]; hours: number; inspiration: string };
export type Career = {
  key: string;
  title: string;
  emoji: string;
  description: string;
  demand: "High" | "Very High" | "Medium";
  salary: string;
  difficulty: Difficulty;
  growth: string;
  remote: "Excellent" | "Good" | "Limited";
  timeToLearn: string;
  skills: string[];
  roadmap: RoadmapStep[];
  projects: Project[];
};

// Build a YouTube search URL that lands on a relevant video (not a channel page).
const yt = (creator: string) => (t: string, d: string, l: Difficulty = "Beginner") => ({
  title: t,
  creator,
  duration: d,
  level: l,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${t} ${creator}`)}`,
});
const fcc = yt("freeCodeCamp");
const harry = yt("CodeWithHarry");
const hitesh = yt("Hitesh Choudhary");
const ninja = yt("Net Ninja");
const traversy = yt("Traversy Media");
const supersimple = yt("SuperSimpleDev");
const apna = yt("Apna College");

export const careers: Career[] = [
  {
    key: "frontend",
    title: "Frontend Developer",
    emoji: "🎨",
    description: "Build the parts of the web users see and touch. Translate design into fluid, accessible interfaces.",
    demand: "Very High", salary: "$75k – $160k", difficulty: "Beginner", growth: "+13% / yr", remote: "Excellent", timeToLearn: "6–9 months",
    skills: ["HTML", "CSS", "JavaScript", "React", "Git", "Tailwind", "TypeScript", "Accessibility"],
    roadmap: [
      { key: "html", title: "HTML Foundations", level: "Beginner", hours: 15, description: "Semantic markup, forms, accessibility basics.", resources: [supersimple("HTML Full Course", "4h"), fcc("HTML Tutorial", "2h")] },
      { key: "css", title: "CSS & Layout", level: "Beginner", hours: 25, description: "Flexbox, Grid, responsive design, modern CSS.", resources: [ninja("Modern CSS"," 6h", "Beginner"), supersimple("CSS Course", "11h")] },
      { key: "js", title: "JavaScript Essentials", level: "Beginner", hours: 50, description: "Variables, control flow, DOM, async, ES6+.", resources: [supersimple("JavaScript Full Course", "21h"), apna("JS in Hindi", "15h")] },
      { key: "git", title: "Git & GitHub", level: "Beginner", hours: 8, description: "Version control fundamentals.", resources: [hitesh("Git & GitHub", "4h", "Beginner")] },
      { key: "react", title: "React", level: "Intermediate", hours: 60, description: "Components, hooks, state, routing, data fetching.", resources: [traversy("React Crash Course 2024", "3h"), hitesh("React in 1 Video", "5h")] },
      { key: "ts", title: "TypeScript", level: "Intermediate", hours: 20, description: "Static typing for safer JS apps.", resources: [ninja("TS Tutorial", "2h")] },
      { key: "tailwind", title: "Tailwind CSS", level: "Intermediate", hours: 12, description: "Utility-first styling for production speed.", resources: [traversy("Tailwind Crash Course", "2h", "Beginner")] },
      { key: "deploy", title: "Deployment", level: "Intermediate", hours: 6, description: "Vercel, Netlify, CI/CD basics.", resources: [traversy("Vercel Deployment", "1h", "Beginner")] },
      { key: "portfolio", title: "Portfolio & Projects", level: "Intermediate", hours: 40, description: "Ship 3–5 polished apps publicly.", resources: [traversy("Portfolio Build", "4h")] },
      { key: "interview", title: "Interview Prep", level: "Advanced", hours: 30, description: "DSA basics, system design, behavioral.", resources: [fcc("Frontend Interview", "5h")] },
    ],
    projects: [
      { title: "Portfolio Website", level: "Beginner", tech: ["React", "Tailwind"], hours: 12, inspiration: "https://github.com/topics/portfolio" },
      { title: "Weather App", level: "Beginner", tech: ["React", "API"], hours: 8, inspiration: "https://github.com/topics/weather-app" },
      { title: "Steam Clone", level: "Intermediate", tech: ["React", "Tailwind"], hours: 25, inspiration: "https://github.com/topics/steam-clone" },
      { title: "AI Dashboard", level: "Advanced", tech: ["React", "Charts", "AI"], hours: 40, inspiration: "https://github.com/topics/ai-dashboard" },
      { title: "E-commerce Store", level: "Advanced", tech: ["React", "Stripe"], hours: 50, inspiration: "https://github.com/topics/ecommerce" },
    ],
  },
  {
    key: "backend",
    title: "Backend Developer",
    emoji: "⚙️",
    description: "Design APIs, databases, and the systems that make web apps tick.",
    demand: "Very High", salary: "$85k – $180k", difficulty: "Intermediate", growth: "+15% / yr", remote: "Excellent", timeToLearn: "8–12 months",
    skills: ["Node.js", "Python", "SQL", "REST", "Databases", "Auth", "Caching", "Linux"],
    roadmap: [
      { key: "lang", title: "Pick a Language (Node/Python)", level: "Beginner", hours: 40, description: "Master one server language deeply.", resources: [hitesh("Node.js Mastery", "10h"), fcc("Python Backend", "12h")] },
      { key: "http", title: "HTTP & REST APIs", level: "Beginner", hours: 15, description: "Routes, status codes, REST principles.", resources: [traversy("REST API Crash", "1h", "Beginner")] },
      { key: "db", title: "Databases (SQL & NoSQL)", level: "Intermediate", hours: 30, description: "Postgres, schema design, indexes, MongoDB.", resources: [fcc("PostgreSQL Course", "4h")] },
      { key: "auth", title: "Auth & Security", level: "Intermediate", hours: 18, description: "JWT, OAuth, hashing, RBAC.", resources: [ninja("JWT Auth", "1h")] },
      { key: "deploy", title: "Deploy & Scale", level: "Advanced", hours: 20, description: "Docker, CI/CD, cloud hosting.", resources: [traversy("Docker Course", "2h", "Intermediate")] },
      { key: "system", title: "System Design", level: "Advanced", hours: 40, description: "Caching, queues, microservices.", resources: [fcc("System Design", "5h", "Advanced")] },
    ],
    projects: [
      { title: "REST API for Blog", level: "Beginner", tech: ["Node", "Express", "Mongo"], hours: 15, inspiration: "https://github.com/topics/blog-api" },
      { title: "Auth Service", level: "Intermediate", tech: ["Node", "JWT", "Postgres"], hours: 20, inspiration: "https://github.com/topics/auth-service" },
      { title: "URL Shortener", level: "Intermediate", tech: ["Node", "Redis"], hours: 12, inspiration: "https://github.com/topics/url-shortener" },
      { title: "Realtime Chat", level: "Advanced", tech: ["WebSocket", "Redis"], hours: 30, inspiration: "https://github.com/topics/chat-app" },
    ],
  },
  {
    key: "fullstack",
    title: "Full Stack Developer",
    emoji: "🧩",
    description: "Own features end-to-end: UI, API, database, deploy.",
    demand: "Very High", salary: "$90k – $190k", difficulty: "Intermediate", growth: "+17% / yr", remote: "Excellent", timeToLearn: "10–14 months",
    skills: ["React", "Node", "TypeScript", "SQL", "REST/GraphQL", "Docker", "Cloud"],
    roadmap: [
      { key: "fe", title: "Frontend Core", level: "Beginner", hours: 80, description: "HTML, CSS, JS, React.", resources: [supersimple("React Course", "10h")] },
      { key: "be", title: "Backend Core", level: "Intermediate", hours: 60, description: "Node, Express, REST.", resources: [hitesh("Node Backend", "8h")] },
      { key: "db", title: "Database", level: "Intermediate", hours: 25, description: "Postgres + an ORM.", resources: [fcc("Prisma Tutorial", "2h")] },
      { key: "auth", title: "Auth & Storage", level: "Intermediate", hours: 15, description: "Sessions, JWT, file uploads.", resources: [ninja("Firebase Auth", "1h")] },
      { key: "deploy", title: "Full-Stack Deploy", level: "Advanced", hours: 12, description: "Vercel + managed DB.", resources: [traversy("Deploy Full Stack", "1h")] },
      { key: "scale", title: "Scaling Patterns", level: "Advanced", hours: 25, description: "Caching, queues, observability.", resources: [fcc("Scaling Apps", "3h", "Advanced")] },
    ],
    projects: [
      { title: "Notes SaaS", level: "Intermediate", tech: ["React", "Node", "Postgres"], hours: 30, inspiration: "https://github.com/topics/saas-app" },
      { title: "AI Image App", level: "Advanced", tech: ["React", "Node", "AI"], hours: 40, inspiration: "https://github.com/topics/ai-image" },
      { title: "Marketplace", level: "Advanced", tech: ["Next", "Stripe"], hours: 60, inspiration: "https://github.com/topics/marketplace" },
    ],
  },
  {
    key: "ai-engineer",
    title: "AI Engineer",
    emoji: "🤖",
    description: "Build systems powered by LLMs and ML — RAG, agents, fine-tuning.",
    demand: "Very High", salary: "$120k – $260k", difficulty: "Advanced", growth: "+38% / yr", remote: "Excellent", timeToLearn: "12–18 months",
    skills: ["Python", "PyTorch", "LangChain", "LLMs", "Vector DBs", "Prompting", "MLOps"],
    roadmap: [
      { key: "py", title: "Python for AI", level: "Beginner", hours: 30, description: "Numpy, pandas, OOP.", resources: [fcc("Python for Data", "12h")] },
      { key: "ml", title: "ML Foundations", level: "Intermediate", hours: 60, description: "Regression, classification, neural nets.", resources: [fcc("ML Course", "10h", "Intermediate")] },
      { key: "dl", title: "Deep Learning", level: "Advanced", hours: 80, description: "PyTorch, transformers.", resources: [fcc("PyTorch Course", "25h", "Advanced")] },
      { key: "llm", title: "LLM Engineering", level: "Advanced", hours: 40, description: "Prompting, RAG, agents.", resources: [traversy("LangChain Crash", "2h", "Advanced")] },
      { key: "deploy", title: "Deploy AI Apps", level: "Advanced", hours: 20, description: "Inference, vector DBs, latency.", resources: [fcc("Vector DB Tutorial", "2h", "Advanced")] },
    ],
    projects: [
      { title: "PDF Chatbot (RAG)", level: "Intermediate", tech: ["Python", "LangChain", "Vector DB"], hours: 25, inspiration: "https://github.com/topics/rag" },
      { title: "Agent Workflow", level: "Advanced", tech: ["LangGraph", "Python"], hours: 40, inspiration: "https://github.com/topics/ai-agent" },
      { title: "Image Classifier", level: "Intermediate", tech: ["PyTorch"], hours: 25, inspiration: "https://github.com/topics/image-classification" },
    ],
  },
  {
    key: "data-scientist",
    title: "Data Scientist",
    emoji: "📊",
    description: "Turn raw data into business decisions through statistics and ML.",
    demand: "Very High", salary: "$95k – $200k", difficulty: "Advanced", growth: "+22% / yr", remote: "Good", timeToLearn: "12–18 months",
    skills: ["Python", "SQL", "Statistics", "Pandas", "Scikit-learn", "Visualization"],
    roadmap: [
      { key: "stats", title: "Statistics & Probability", level: "Beginner", hours: 40, description: "Descriptive & inferential stats.", resources: [fcc("Statistics", "8h")] },
      { key: "py", title: "Python & Pandas", level: "Beginner", hours: 30, description: "Data wrangling.", resources: [fcc("Pandas Tutorial", "4h")] },
      { key: "sql", title: "SQL", level: "Beginner", hours: 20, description: "Queries, joins, window functions.", resources: [fcc("SQL Course", "4h")] },
      { key: "ml", title: "ML Algorithms", level: "Intermediate", hours: 60, description: "Sklearn end-to-end.", resources: [fcc("ML w/ Python", "10h", "Intermediate")] },
      { key: "viz", title: "Visualization & Storytelling", level: "Intermediate", hours: 18, description: "Matplotlib, Plotly, dashboards.", resources: [fcc("Plotly Dash", "5h", "Intermediate")] },
    ],
    projects: [
      { title: "EDA on Kaggle Dataset", level: "Beginner", tech: ["Python", "Pandas"], hours: 12, inspiration: "https://kaggle.com" },
      { title: "Churn Prediction", level: "Intermediate", tech: ["Sklearn"], hours: 20, inspiration: "https://github.com/topics/churn-prediction" },
      { title: "Recommender System", level: "Advanced", tech: ["Sklearn", "Streamlit"], hours: 30, inspiration: "https://github.com/topics/recommender-system" },
    ],
  },
  {
    key: "uiux",
    title: "UI/UX Designer",
    emoji: "✨",
    description: "Craft delightful, intuitive product experiences from research to pixel.",
    demand: "High", salary: "$70k – $150k", difficulty: "Beginner", growth: "+13% / yr", remote: "Excellent", timeToLearn: "6–10 months",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    roadmap: [
      { key: "principles", title: "Design Principles", level: "Beginner", hours: 20, description: "Hierarchy, contrast, color, typography.", resources: [fcc("Design Principles", "3h")] },
      { key: "figma", title: "Figma Mastery", level: "Beginner", hours: 25, description: "Components, auto-layout, variants.", resources: [traversy("Figma Tutorial", "3h", "Beginner")] },
      { key: "research", title: "User Research", level: "Intermediate", hours: 25, description: "Interviews, personas, JTBD.", resources: [fcc("UX Research", "4h", "Intermediate")] },
      { key: "proto", title: "Prototyping & Testing", level: "Intermediate", hours: 20, description: "Click-throughs, usability tests.", resources: [traversy("Prototype in Figma", "1h", "Intermediate")] },
      { key: "system", title: "Design Systems", level: "Advanced", hours: 30, description: "Tokens, libraries, governance.", resources: [fcc("Design Systems", "3h", "Advanced")] },
    ],
    projects: [
      { title: "Mobile App Redesign", level: "Beginner", tech: ["Figma"], hours: 15, inspiration: "https://dribbble.com" },
      { title: "End-to-End Case Study", level: "Intermediate", tech: ["Figma", "Notion"], hours: 30, inspiration: "https://www.behance.net" },
      { title: "Design System Library", level: "Advanced", tech: ["Figma"], hours: 40, inspiration: "https://github.com/topics/design-system" },
    ],
  },
  {
    key: "cyber",
    title: "Cybersecurity Analyst",
    emoji: "🛡️",
    description: "Defend systems, hunt threats, and harden infrastructure.",
    demand: "Very High", salary: "$90k – $180k", difficulty: "Advanced", growth: "+33% / yr", remote: "Good", timeToLearn: "12–18 months",
    skills: ["Networking", "Linux", "Python", "SIEM", "OWASP", "Cryptography"],
    roadmap: [
      { key: "net", title: "Networking", level: "Beginner", hours: 35, description: "TCP/IP, DNS, HTTP, firewalls.", resources: [fcc("Networking Course", "10h")] },
      { key: "linux", title: "Linux & Bash", level: "Beginner", hours: 25, description: "Shell, permissions, processes.", resources: [fcc("Linux Crash", "5h")] },
      { key: "sec", title: "Security Foundations", level: "Intermediate", hours: 40, description: "OWASP Top 10, attack surface.", resources: [fcc("Cybersecurity Course", "8h", "Intermediate")] },
      { key: "tools", title: "Tooling (Burp, Wireshark, Nmap)", level: "Intermediate", hours: 25, description: "Hands-on with offensive & defensive tools.", resources: [fcc("Pentesting", "5h", "Intermediate")] },
      { key: "blue", title: "Blue Team / SOC", level: "Advanced", hours: 35, description: "SIEM, log analysis, IR.", resources: [fcc("SOC Analyst", "4h", "Advanced")] },
    ],
    projects: [
      { title: "Home Lab Setup", level: "Beginner", tech: ["VMware", "Linux"], hours: 15, inspiration: "https://github.com/topics/homelab" },
      { title: "CTF Challenges", level: "Intermediate", tech: ["Various"], hours: 40, inspiration: "https://ctftime.org" },
      { title: "Threat-Hunting Dashboard", level: "Advanced", tech: ["ELK", "Python"], hours: 30, inspiration: "https://github.com/topics/siem" },
    ],
  },
  {
    key: "game",
    title: "Game Developer",
    emoji: "🎮",
    description: "Build interactive worlds — from indie pixel art to AAA engines.",
    demand: "Medium", salary: "$60k – $140k", difficulty: "Intermediate", growth: "+10% / yr", remote: "Good", timeToLearn: "12–18 months",
    skills: ["C#", "Unity", "Unreal", "C++", "Math", "Shaders"],
    roadmap: [
      { key: "lang", title: "C# or C++", level: "Beginner", hours: 50, description: "Pick an engine language.", resources: [fcc("C# Tutorial", "5h")] },
      { key: "engine", title: "Unity Basics", level: "Beginner", hours: 40, description: "Scenes, scripts, physics.", resources: [ninja("Unity Crash", "5h", "Beginner")] },
      { key: "math", title: "Game Math", level: "Intermediate", hours: 30, description: "Vectors, matrices, lerp.", resources: [fcc("Linear Algebra", "10h", "Intermediate")] },
      { key: "ship", title: "Ship Your First Game", level: "Intermediate", hours: 60, description: "Polish + publish on itch.io.", resources: [fcc("Build a Game", "4h", "Intermediate")] },
    ],
    projects: [
      { title: "2D Platformer", level: "Beginner", tech: ["Unity", "C#"], hours: 25, inspiration: "https://itch.io" },
      { title: "Multiplayer Lobby", level: "Advanced", tech: ["Unity", "Networking"], hours: 50, inspiration: "https://github.com/topics/multiplayer-game" },
    ],
  },
  {
    key: "devops",
    title: "DevOps Engineer",
    emoji: "🚀",
    description: "Automate the path from code to production at scale.",
    demand: "Very High", salary: "$110k – $210k", difficulty: "Advanced", growth: "+24% / yr", remote: "Excellent", timeToLearn: "12–18 months",
    skills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform", "AWS/GCP"],
    roadmap: [
      { key: "linux", title: "Linux & Bash", level: "Beginner", hours: 30, description: "Servers, services, scripting.", resources: [fcc("Linux Course", "5h")] },
      { key: "docker", title: "Docker", level: "Intermediate", hours: 20, description: "Containers, compose.", resources: [traversy("Docker Tutorial", "2h", "Intermediate")] },
      { key: "k8s", title: "Kubernetes", level: "Advanced", hours: 40, description: "Pods, services, helm.", resources: [fcc("K8s Course", "5h", "Advanced")] },
      { key: "ci", title: "CI/CD", level: "Intermediate", hours: 18, description: "GitHub Actions, pipelines.", resources: [fcc("GitHub Actions", "2h", "Intermediate")] },
      { key: "iac", title: "IaC (Terraform)", level: "Advanced", hours: 30, description: "Provision cloud declaratively.", resources: [fcc("Terraform Course", "4h", "Advanced")] },
      { key: "cloud", title: "Cloud (AWS/GCP)", level: "Advanced", hours: 50, description: "Core services, IAM.", resources: [fcc("AWS Course", "10h", "Advanced")] },
    ],
    projects: [
      { title: "CI/CD Pipeline", level: "Intermediate", tech: ["GH Actions", "Docker"], hours: 20, inspiration: "https://github.com/topics/cicd" },
      { title: "K8s Microservices", level: "Advanced", tech: ["K8s", "Helm"], hours: 40, inspiration: "https://github.com/topics/kubernetes" },
    ],
  },
  {
    key: "cloud",
    title: "Cloud Engineer",
    emoji: "☁️",
    description: "Architect, secure, and operate workloads in AWS/GCP/Azure.",
    demand: "Very High", salary: "$105k – $200k", difficulty: "Advanced", growth: "+20% / yr", remote: "Excellent", timeToLearn: "10–15 months",
    skills: ["AWS", "Networking", "IAM", "Terraform", "Linux", "Python"],
    roadmap: [
      { key: "found", title: "Cloud Foundations", level: "Beginner", hours: 25, description: "Regions, services overview.", resources: [fcc("AWS Foundations", "5h")] },
      { key: "compute", title: "Compute & Storage", level: "Intermediate", hours: 30, description: "EC2, S3, EBS.", resources: [fcc("AWS Compute", "4h", "Intermediate")] },
      { key: "net", title: "VPC & Networking", level: "Intermediate", hours: 25, description: "Subnets, routing, security groups.", resources: [fcc("AWS VPC", "3h", "Intermediate")] },
      { key: "iam", title: "IAM & Security", level: "Advanced", hours: 20, description: "Least privilege, policies.", resources: [fcc("IAM Deep Dive", "3h", "Advanced")] },
      { key: "iac", title: "Terraform", level: "Advanced", hours: 25, description: "IaC for cloud.", resources: [fcc("Terraform AWS", "3h", "Advanced")] },
    ],
    projects: [
      { title: "Static Site on AWS", level: "Beginner", tech: ["S3", "CloudFront"], hours: 6, inspiration: "https://github.com/topics/aws-static-site" },
      { title: "3-Tier Web App", level: "Advanced", tech: ["EC2", "RDS", "ALB"], hours: 30, inspiration: "https://github.com/topics/aws-architecture" },
    ],
  },
  {
    key: "marketer",
    title: "Digital Marketer",
    emoji: "📈",
    description: "Drive growth through SEO, ads, content, email, and analytics.",
    demand: "High", salary: "$55k – $130k", difficulty: "Beginner", growth: "+10% / yr", remote: "Excellent", timeToLearn: "5–8 months",
    skills: ["SEO", "Google Ads", "Meta Ads", "Analytics", "Copywriting", "Email"],
    roadmap: [
      { key: "fund", title: "Marketing Fundamentals", level: "Beginner", hours: 20, description: "Funnels, channels, ICP.", resources: [fcc("Marketing 101", "3h")] },
      { key: "seo", title: "SEO", level: "Beginner", hours: 25, description: "Keywords, on-page, link-building.", resources: [harry("SEO Course", "4h")] },
      { key: "ads", title: "Paid Ads", level: "Intermediate", hours: 30, description: "Google + Meta ads.", resources: [fcc("Google Ads", "4h", "Intermediate")] },
      { key: "email", title: "Email & Lifecycle", level: "Intermediate", hours: 15, description: "Sequences, segmentation.", resources: [fcc("Email Marketing", "2h", "Intermediate")] },
      { key: "analytics", title: "Analytics", level: "Intermediate", hours: 18, description: "GA4, dashboards, attribution.", resources: [fcc("GA4 Course", "3h", "Intermediate")] },
    ],
    projects: [
      { title: "SEO Audit Report", level: "Beginner", tech: ["Sheets", "Ahrefs"], hours: 10, inspiration: "https://ahrefs.com/blog" },
      { title: "Paid Campaign", level: "Intermediate", tech: ["Google Ads"], hours: 15, inspiration: "https://growth.design" },
    ],
  },
  {
    key: "pm",
    title: "Product Manager",
    emoji: "🎯",
    description: "Define what to build and why — at the intersection of users, biz, and tech.",
    demand: "High", salary: "$95k – $200k", difficulty: "Intermediate", growth: "+12% / yr", remote: "Excellent", timeToLearn: "8–14 months",
    skills: ["Discovery", "Roadmapping", "Analytics", "Communication", "Prioritization"],
    roadmap: [
      { key: "fund", title: "Product Fundamentals", level: "Beginner", hours: 25, description: "Discovery, opportunity solution trees.", resources: [fcc("Product Management", "3h")] },
      { key: "ux", title: "UX & Research", level: "Beginner", hours: 20, description: "User interviews, JTBD.", resources: [fcc("UX Research", "4h", "Beginner")] },
      { key: "data", title: "Product Analytics", level: "Intermediate", hours: 25, description: "Mixpanel, SQL basics.", resources: [fcc("SQL for PMs", "2h", "Intermediate")] },
      { key: "strat", title: "Strategy & Roadmaps", level: "Advanced", hours: 30, description: "OKRs, prioritization.", resources: [fcc("Product Strategy", "3h", "Advanced")] },
    ],
    projects: [
      { title: "Product Spec Doc", level: "Beginner", tech: ["Notion"], hours: 6, inspiration: "https://www.lennysnewsletter.com" },
      { title: "Launch a Side Product", level: "Advanced", tech: ["Various"], hours: 60, inspiration: "https://www.producthunt.com" },
    ],
  },
  {
    key: "mobile",
    title: "Mobile Developer",
    emoji: "📱",
    description: "Ship beautiful native and cross-platform mobile experiences for iOS and Android.",
    demand: "Very High", salary: "$85k – $180k", difficulty: "Intermediate", growth: "+18% / yr", remote: "Excellent", timeToLearn: "8–12 months",
    skills: ["React Native", "Swift", "Kotlin", "Flutter", "REST", "App Store", "Push Notifications"],
    roadmap: [
      { key: "js", title: "JavaScript & TypeScript", level: "Beginner", hours: 40, description: "Solid JS foundations before mobile.", resources: [supersimple("JavaScript Course", "21h"), ninja("TypeScript", "2h")] },
      { key: "rn", title: "React Native Core", level: "Intermediate", hours: 50, description: "Components, navigation, native modules.", resources: [traversy("React Native Crash", "2h", "Intermediate"), fcc("React Native Course", "12h")] },
      { key: "native", title: "Native Platforms", level: "Intermediate", hours: 35, description: "Swift basics for iOS, Kotlin for Android.", resources: [fcc("Swift Course", "5h", "Intermediate"), fcc("Kotlin Course", "6h", "Intermediate")] },
      { key: "state", title: "State & Data", level: "Intermediate", hours: 20, description: "Redux, Zustand, AsyncStorage, offline-first.", resources: [ninja("Redux Toolkit", "2h", "Intermediate")] },
      { key: "publish", title: "Publish to Stores", level: "Advanced", hours: 15, description: "App Store + Play Store submission.", resources: [fcc("Publish App", "1h", "Advanced")] },
    ],
    projects: [
      { title: "Expense Tracker App", level: "Beginner", tech: ["React Native"], hours: 15, inspiration: "https://github.com/topics/react-native" },
      { title: "Social Feed Clone", level: "Intermediate", tech: ["RN", "Firebase"], hours: 30, inspiration: "https://github.com/topics/instagram-clone" },
      { title: "Fitness Tracker", level: "Advanced", tech: ["RN", "HealthKit"], hours: 50, inspiration: "https://github.com/topics/fitness-app" },
    ],
  },
  {
    key: "ml-engineer",
    title: "ML Engineer",
    emoji: "🧠",
    description: "Productionize machine learning models — training pipelines, serving, monitoring.",
    demand: "Very High", salary: "$130k – $260k", difficulty: "Advanced", growth: "+30% / yr", remote: "Excellent", timeToLearn: "12–18 months",
    skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "Docker", "Kubernetes", "Spark"],
    roadmap: [
      { key: "math", title: "Math for ML", level: "Intermediate", hours: 40, description: "Linear algebra, calculus, probability.", resources: [fcc("Linear Algebra", "10h", "Intermediate")] },
      { key: "ml", title: "Classical ML", level: "Intermediate", hours: 50, description: "Sklearn, model evaluation, feature engineering.", resources: [fcc("ML w/ Python", "10h", "Intermediate")] },
      { key: "dl", title: "Deep Learning", level: "Advanced", hours: 70, description: "Neural nets, CNNs, RNNs, transformers.", resources: [fcc("PyTorch Course", "25h", "Advanced")] },
      { key: "mlops", title: "MLOps", level: "Advanced", hours: 35, description: "Model serving, CI/CD, monitoring drift.", resources: [fcc("MLflow Tutorial", "3h", "Advanced")] },
      { key: "scale", title: "Distributed Training", level: "Advanced", hours: 25, description: "Spark, multi-GPU, data pipelines.", resources: [fcc("Spark Course", "3h", "Advanced")] },
    ],
    projects: [
      { title: "Sentiment Classifier", level: "Intermediate", tech: ["PyTorch"], hours: 20, inspiration: "https://github.com/topics/sentiment-analysis" },
      { title: "Model Serving API", level: "Advanced", tech: ["FastAPI", "Docker"], hours: 30, inspiration: "https://github.com/topics/model-serving" },
      { title: "End-to-end ML Pipeline", level: "Advanced", tech: ["MLflow", "Airflow"], hours: 50, inspiration: "https://github.com/topics/mlops" },
    ],
  },
  {
    key: "data-engineer",
    title: "Data Engineer",
    emoji: "🛠️",
    description: "Design pipelines that move and shape data at scale for analytics and ML.",
    demand: "Very High", salary: "$100k – $210k", difficulty: "Advanced", growth: "+21% / yr", remote: "Excellent", timeToLearn: "10–15 months",
    skills: ["SQL", "Python", "Airflow", "Spark", "Kafka", "dbt", "Snowflake/BigQuery"],
    roadmap: [
      { key: "sql", title: "Advanced SQL", level: "Beginner", hours: 30, description: "CTEs, window functions, optimization.", resources: [fcc("SQL Course", "4h"), fcc("Advanced SQL", "5h", "Intermediate")] },
      { key: "py", title: "Python for Data", level: "Beginner", hours: 25, description: "Pandas, requests, ETL scripting.", resources: [fcc("Python Data", "12h")] },
      { key: "warehouse", title: "Data Warehousing", level: "Intermediate", hours: 25, description: "Snowflake, BigQuery, dimensional modeling.", resources: [fcc("Data Warehousing", "5h", "Intermediate")] },
      { key: "orchestration", title: "Orchestration (Airflow)", level: "Intermediate", hours: 25, description: "DAGs, scheduling, sensors.", resources: [fcc("Airflow Course", "3h", "Intermediate")] },
      { key: "stream", title: "Streaming (Kafka/Spark)", level: "Advanced", hours: 35, description: "Real-time pipelines, partitions.", resources: [fcc("Kafka Course", "4h", "Advanced"), fcc("Spark Course", "3h", "Advanced")] },
      { key: "dbt", title: "dbt & Analytics Eng.", level: "Advanced", hours: 20, description: "Modeling layer, tests, docs.", resources: [fcc("dbt Tutorial", "2h", "Advanced")] },
    ],
    projects: [
      { title: "Batch ETL Pipeline", level: "Intermediate", tech: ["Airflow", "Postgres"], hours: 25, inspiration: "https://github.com/topics/etl" },
      { title: "Streaming Pipeline", level: "Advanced", tech: ["Kafka", "Spark"], hours: 40, inspiration: "https://github.com/topics/data-pipeline" },
      { title: "Analytics Mart with dbt", level: "Advanced", tech: ["dbt", "Snowflake"], hours: 30, inspiration: "https://github.com/topics/dbt" },
    ],
  },
  {
    key: "blockchain",
    title: "Blockchain Developer",
    emoji: "⛓️",
    description: "Build smart contracts and decentralized apps on EVM and beyond.",
    demand: "High", salary: "$90k – $200k", difficulty: "Advanced", growth: "+18% / yr", remote: "Excellent", timeToLearn: "10–14 months",
    skills: ["Solidity", "Hardhat", "Ethers.js", "EVM", "Security", "Web3"],
    roadmap: [
      { key: "fund", title: "Blockchain Fundamentals", level: "Beginner", hours: 20, description: "Hashing, Merkle trees, consensus.", resources: [fcc("Blockchain Basics", "4h")] },
      { key: "sol", title: "Solidity", level: "Intermediate", hours: 40, description: "Smart contracts, gas, patterns.", resources: [fcc("Solidity Course", "16h", "Intermediate")] },
      { key: "tools", title: "Hardhat & Testing", level: "Intermediate", hours: 20, description: "Local chain, scripts, fork tests.", resources: [fcc("Hardhat Tutorial", "3h", "Intermediate")] },
      { key: "dapp", title: "Frontend dApp", level: "Intermediate", hours: 25, description: "Ethers.js, wallets, RainbowKit.", resources: [traversy("Wagmi Tutorial", "2h", "Intermediate")] },
      { key: "sec", title: "Smart Contract Security", level: "Advanced", hours: 30, description: "Reentrancy, MEV, audits.", resources: [fcc("Security Course", "3h", "Advanced")] },
    ],
    projects: [
      { title: "ERC-20 Token", level: "Beginner", tech: ["Solidity"], hours: 8, inspiration: "https://github.com/topics/erc20" },
      { title: "NFT Marketplace", level: "Advanced", tech: ["Solidity", "Next"], hours: 50, inspiration: "https://github.com/topics/nft-marketplace" },
      { title: "DeFi Vault", level: "Advanced", tech: ["Solidity", "Foundry"], hours: 40, inspiration: "https://github.com/topics/defi" },
    ],
  },
  {
    key: "qa",
    title: "QA / Test Engineer",
    emoji: "🧪",
    description: "Guarantee quality through automated and exploratory testing across the stack.",
    demand: "High", salary: "$65k – $140k", difficulty: "Beginner", growth: "+9% / yr", remote: "Excellent", timeToLearn: "5–9 months",
    skills: ["Cypress", "Playwright", "Jest", "API Testing", "CI/CD", "Test Strategy"],
    roadmap: [
      { key: "fund", title: "Testing Fundamentals", level: "Beginner", hours: 15, description: "Pyramid, types of tests, strategy.", resources: [fcc("Testing 101", "2h")] },
      { key: "unit", title: "Unit Testing (Jest)", level: "Beginner", hours: 20, description: "Mocks, coverage, TDD.", resources: [ninja("Jest Tutorial", "2h", "Beginner")] },
      { key: "e2e", title: "E2E (Playwright/Cypress)", level: "Intermediate", hours: 30, description: "Selectors, fixtures, CI integration.", resources: [traversy("Playwright Crash", "2h", "Intermediate")] },
      { key: "api", title: "API Testing", level: "Intermediate", hours: 15, description: "Postman, contract testing.", resources: [fcc("Postman Course", "2h", "Intermediate")] },
      { key: "perf", title: "Performance & Load", level: "Advanced", hours: 20, description: "k6, Lighthouse, profiling.", resources: [fcc("k6 Tutorial", "1h", "Advanced")] },
    ],
    projects: [
      { title: "E2E Suite for SaaS", level: "Intermediate", tech: ["Playwright"], hours: 25, inspiration: "https://github.com/topics/playwright" },
      { title: "API Test Framework", level: "Intermediate", tech: ["Postman", "Newman"], hours: 18, inspiration: "https://github.com/topics/api-testing" },
    ],
  },
  {
    key: "tech-writer",
    title: "Technical Writer",
    emoji: "✍️",
    description: "Translate complex tech into clear docs, tutorials, and developer experiences.",
    demand: "High", salary: "$70k – $150k", difficulty: "Beginner", growth: "+8% / yr", remote: "Excellent", timeToLearn: "4–7 months",
    skills: ["Writing", "Markdown", "Git", "API Docs", "Information Architecture"],
    roadmap: [
      { key: "writing", title: "Clear Technical Writing", level: "Beginner", hours: 20, description: "Voice, tone, plain language.", resources: [fcc("Tech Writing", "3h")] },
      { key: "docs", title: "Docs as Code", level: "Beginner", hours: 15, description: "Markdown, MDX, static sites.", resources: [traversy("Docusaurus", "1h", "Beginner")] },
      { key: "api", title: "API Documentation", level: "Intermediate", hours: 20, description: "OpenAPI, references, examples.", resources: [fcc("OpenAPI Tutorial", "2h", "Intermediate")] },
      { key: "ia", title: "Information Architecture", level: "Intermediate", hours: 18, description: "Structure, navigation, search.", resources: [fcc("IA Course", "2h", "Intermediate")] },
    ],
    projects: [
      { title: "OSS Project Docs", level: "Beginner", tech: ["Markdown"], hours: 12, inspiration: "https://github.com/topics/documentation" },
      { title: "Developer Portal", level: "Advanced", tech: ["Docusaurus"], hours: 30, inspiration: "https://docusaurus.io/showcase" },
    ],
  },
  {
    key: "arvr",
    title: "AR/VR Developer",
    emoji: "🕶️",
    description: "Create immersive 3D experiences for headsets, mobile, and the spatial web.",
    demand: "Medium", salary: "$85k – $170k", difficulty: "Advanced", growth: "+25% / yr", remote: "Good", timeToLearn: "12–18 months",
    skills: ["Unity", "Unreal", "C#", "WebXR", "3D Math", "Shaders"],
    roadmap: [
      { key: "lang", title: "C# / C++", level: "Beginner", hours: 40, description: "Engine scripting language.", resources: [fcc("C# Tutorial", "5h")] },
      { key: "unity", title: "Unity & XR Toolkit", level: "Intermediate", hours: 50, description: "XR Interaction, locomotion, hands.", resources: [fcc("Unity XR", "5h", "Intermediate")] },
      { key: "3d", title: "3D Math & Shaders", level: "Advanced", hours: 35, description: "Quaternions, matrices, GLSL/HLSL.", resources: [fcc("Shaders Course", "3h", "Advanced")] },
      { key: "webxr", title: "WebXR", level: "Advanced", hours: 25, description: "Three.js, A-Frame for browser VR.", resources: [traversy("Three.js Crash", "2h", "Advanced")] },
    ],
    projects: [
      { title: "VR Room Escape", level: "Intermediate", tech: ["Unity"], hours: 35, inspiration: "https://github.com/topics/vr-game" },
      { title: "AR Product Viewer", level: "Advanced", tech: ["Unity AR"], hours: 30, inspiration: "https://github.com/topics/augmented-reality" },
    ],
  },
  {
    key: "sre",
    title: "Site Reliability Engineer",
    emoji: "🔧",
    description: "Keep production fast, reliable, and observable. SLOs, on-call, automation.",
    demand: "Very High", salary: "$120k – $230k", difficulty: "Advanced", growth: "+22% / yr", remote: "Excellent", timeToLearn: "12–18 months",
    skills: ["Linux", "Networking", "Observability", "Kubernetes", "Terraform", "Go/Python"],
    roadmap: [
      { key: "linux", title: "Linux & Systems", level: "Beginner", hours: 35, description: "Processes, signals, performance tools.", resources: [fcc("Linux Course", "5h")] },
      { key: "obs", title: "Observability", level: "Intermediate", hours: 30, description: "Metrics, logs, tracing, SLOs.", resources: [fcc("Prometheus Course", "3h", "Intermediate")] },
      { key: "k8s", title: "Kubernetes Ops", level: "Advanced", hours: 45, description: "Operators, HPA, networking.", resources: [fcc("K8s Course", "5h", "Advanced")] },
      { key: "ir", title: "Incident Response", level: "Advanced", hours: 20, description: "Runbooks, postmortems, chaos eng.", resources: [fcc("SRE Course", "3h", "Advanced")] },
    ],
    projects: [
      { title: "Observability Stack", level: "Intermediate", tech: ["Prometheus", "Grafana"], hours: 25, inspiration: "https://github.com/topics/observability" },
      { title: "Chaos Eng. Game Day", level: "Advanced", tech: ["K8s", "Litmus"], hours: 30, inspiration: "https://github.com/topics/chaos-engineering" },
    ],
  },
];

export const careersByKey = Object.fromEntries(careers.map((c) => [c.key, c]));
