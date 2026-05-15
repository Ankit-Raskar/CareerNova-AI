export type ResourceLevel = "Beginner" | "Intermediate" | "Advanced" | "All Levels";
export type ResourceCategory =
  | "Frontend"
  | "Backend"
  | "Full Stack"
  | "AI/ML"
  | "UI/UX"
  | "DSA"
  | "DevOps"
  | "Interview Prep";

export interface Resource {
  id: string;
  title: string;
  provider: string;
  level: ResourceLevel;
  category: ResourceCategory;
  description: string;
  duration: string;
  link: string;
  tags?: string[];
}

export const resources: Resource[] = [
  // Frontend
  { id: "the-odin-project", title: "The Odin Project", provider: "Odin", level: "Beginner", category: "Frontend", description: "Free full-stack curriculum with HTML, CSS, JavaScript and React.", duration: "Self-paced", link: "https://www.theodinproject.com/", tags: ["HTML", "CSS", "JS", "React"] },
  { id: "javascript-info", title: "The Modern JavaScript Tutorial", provider: "javascript.info", level: "All Levels", category: "Frontend", description: "Deep, well-written reference covering the language end-to-end.", duration: "Reference", link: "https://javascript.info/", tags: ["JavaScript"] },
  { id: "react-docs", title: "React Official Docs", provider: "React", level: "All Levels", category: "Frontend", description: "Modern React with hooks, server components and best practices.", duration: "Reference", link: "https://react.dev/learn", tags: ["React"] },
  { id: "css-tricks-flexbox", title: "A Complete Guide to Flexbox", provider: "CSS-Tricks", level: "Beginner", category: "Frontend", description: "The canonical visual reference for flexbox.", duration: "30 min", link: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", tags: ["CSS"] },
  { id: "frontend-masters-bootcamp", title: "Frontend Developer Bootcamp", provider: "Frontend Masters", level: "Beginner", category: "Frontend", description: "Free bootcamp covering HTML, CSS and JavaScript fundamentals.", duration: "21 hours", link: "https://frontendmasters.com/bootcamp/", tags: ["HTML", "CSS", "JS"] },
  { id: "web-dev-google", title: "web.dev Learn", provider: "Google", level: "All Levels", category: "Frontend", description: "Curated learning paths on HTML, CSS, performance and accessibility.", duration: "Self-paced", link: "https://web.dev/learn/", tags: ["Web", "Performance"] },

  // Backend
  { id: "node-docs", title: "Node.js Learn", provider: "Node.js", level: "Intermediate", category: "Backend", description: "Official guides covering async patterns, streams and modules.", duration: "Reference", link: "https://nodejs.org/en/learn", tags: ["Node"] },
  { id: "postgres-tutorial", title: "PostgreSQL Tutorial", provider: "postgresqltutorial.com", level: "Beginner", category: "Backend", description: "Hands-on Postgres tutorial from basics to advanced features.", duration: "Self-paced", link: "https://www.postgresqltutorial.com/", tags: ["SQL", "Postgres"] },
  { id: "mdn-http", title: "HTTP Guide", provider: "MDN", level: "All Levels", category: "Backend", description: "Comprehensive guide to HTTP, methods, headers and caching.", duration: "Reference", link: "https://developer.mozilla.org/en-US/docs/Web/HTTP", tags: ["HTTP"] },
  { id: "rest-api-tutorial", title: "REST API Tutorial", provider: "restfulapi.net", level: "Beginner", category: "Backend", description: "Principles of designing RESTful APIs in plain language.", duration: "2 hours", link: "https://restfulapi.net/", tags: ["REST", "API"] },
  { id: "fastapi-docs", title: "FastAPI Docs", provider: "FastAPI", level: "Intermediate", category: "Backend", description: "Modern Python web framework with first-class typing and async.", duration: "Reference", link: "https://fastapi.tiangolo.com/", tags: ["Python", "FastAPI"] },

  // Full Stack
  { id: "full-stack-open", title: "Full Stack Open", provider: "University of Helsinki", level: "Intermediate", category: "Full Stack", description: "Modern full-stack curriculum: React, Node, GraphQL, TypeScript.", duration: "~150 hours", link: "https://fullstackopen.com/en/", tags: ["React", "Node", "TS"] },
  { id: "freecodecamp", title: "freeCodeCamp Curriculum", provider: "freeCodeCamp", level: "All Levels", category: "Full Stack", description: "Certifications across web dev, data, and machine learning.", duration: "Self-paced", link: "https://www.freecodecamp.org/learn", tags: ["Web", "Certifications"] },
  { id: "cs50w", title: "CS50's Web Programming with Python and JavaScript", provider: "Harvard / edX", level: "Intermediate", category: "Full Stack", description: "Build dynamic web apps using Django, JavaScript and SQL.", duration: "12 weeks", link: "https://cs50.harvard.edu/web/", tags: ["Django", "JS"] },
  { id: "epicweb", title: "Epic Web Workshops", provider: "Kent C. Dodds", level: "Advanced", category: "Full Stack", description: "Production-grade patterns for full-stack React apps.", duration: "Self-paced", link: "https://www.epicweb.dev/", tags: ["React", "Remix"] },

  // AI/ML
  { id: "fastai", title: "Practical Deep Learning for Coders", provider: "fast.ai", level: "Intermediate", category: "AI/ML", description: "Top-down course for shipping deep learning models quickly.", duration: "8 weeks", link: "https://course.fast.ai/", tags: ["Deep Learning", "PyTorch"] },
  { id: "deeplearning-ai", title: "Machine Learning Specialization", provider: "DeepLearning.AI", level: "Beginner", category: "AI/ML", description: "Andrew Ng's modern ML course on Coursera (audit free).", duration: "3 months", link: "https://www.deeplearning.ai/courses/machine-learning-specialization/", tags: ["ML"] },
  { id: "huggingface-course", title: "Hugging Face NLP Course", provider: "Hugging Face", level: "Intermediate", category: "AI/ML", description: "Transformers, fine-tuning, and the HF ecosystem end-to-end.", duration: "Self-paced", link: "https://huggingface.co/learn/nlp-course", tags: ["NLP", "Transformers"] },
  { id: "google-ml-crash", title: "Machine Learning Crash Course", provider: "Google", level: "Beginner", category: "AI/ML", description: "Fast intro to ML with TensorFlow and real exercises.", duration: "15 hours", link: "https://developers.google.com/machine-learning/crash-course", tags: ["ML", "TF"] },
  { id: "karpathy-nn", title: "Neural Networks: Zero to Hero", provider: "Andrej Karpathy", level: "Advanced", category: "AI/ML", description: "Build neural nets from scratch — including a tiny GPT.", duration: "20 hours", link: "https://karpathy.ai/zero-to-hero.html", tags: ["LLM", "Deep Learning"] },
  { id: "spinningup", title: "Spinning Up in Deep RL", provider: "OpenAI", level: "Advanced", category: "AI/ML", description: "Educational resource for deep reinforcement learning.", duration: "Reference", link: "https://spinningup.openai.com/", tags: ["RL"] },

  // UI/UX
  { id: "refactoring-ui", title: "Refactoring UI", provider: "Adam Wathan & Steve Schoger", level: "Intermediate", category: "UI/UX", description: "Practical visual design tactics for developers.", duration: "Book + videos", link: "https://www.refactoringui.com/", tags: ["Design"] },
  { id: "laws-of-ux", title: "Laws of UX", provider: "Jon Yablonski", level: "All Levels", category: "UI/UX", description: "Heuristics designers use to build better products.", duration: "Reference", link: "https://lawsofux.com/", tags: ["UX"] },
  { id: "nngroup", title: "Nielsen Norman Group Articles", provider: "NN/g", level: "All Levels", category: "UI/UX", description: "Research-backed UX writing from the field's foundational firm.", duration: "Reference", link: "https://www.nngroup.com/articles/", tags: ["UX Research"] },
  { id: "material-design", title: "Material Design 3", provider: "Google", level: "All Levels", category: "UI/UX", description: "Comprehensive guidelines for cross-platform UI systems.", duration: "Reference", link: "https://m3.material.io/", tags: ["Design Systems"] },
  { id: "design-better", title: "Design Better Library", provider: "InVision", level: "All Levels", category: "UI/UX", description: "Books and podcasts on design leadership and process.", duration: "Library", link: "https://www.designbetter.co/", tags: ["Design"] },

  // DSA
  { id: "neetcode", title: "NeetCode 150", provider: "NeetCode", level: "Intermediate", category: "DSA", description: "Curated problem set with video walkthroughs for interviews.", duration: "Self-paced", link: "https://neetcode.io/practice", tags: ["LeetCode", "Algorithms"] },
  { id: "cses", title: "CSES Problem Set", provider: "University of Helsinki", level: "Advanced", category: "DSA", description: "300 hand-picked problems covering competitive programming.", duration: "Self-paced", link: "https://cses.fi/problemset/", tags: ["Competitive"] },
  { id: "visualgo", title: "VisuAlgo", provider: "NUS", level: "Beginner", category: "DSA", description: "Animated visualizations of algorithms and data structures.", duration: "Reference", link: "https://visualgo.net/", tags: ["Visualization"] },
  { id: "algo-mit", title: "Introduction to Algorithms (MIT 6.006)", provider: "MIT OCW", level: "Advanced", category: "DSA", description: "Classic MIT course on algorithm design and analysis.", duration: "12 weeks", link: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", tags: ["Algorithms"] },
  { id: "leetcode-patterns", title: "LeetCode Patterns", provider: "Sean Prashad", level: "Intermediate", category: "DSA", description: "Pattern-based catalog of LeetCode problems by topic.", duration: "Reference", link: "https://seanprashad.com/leetcode-patterns/", tags: ["LeetCode"] },

  // DevOps
  { id: "kubernetes-up-running", title: "Kubernetes Tutorials", provider: "kubernetes.io", level: "Intermediate", category: "DevOps", description: "Official tutorials from cluster basics to stateful workloads.", duration: "Reference", link: "https://kubernetes.io/docs/tutorials/", tags: ["K8s"] },
  { id: "docker-getting-started", title: "Docker Getting Started", provider: "Docker", level: "Beginner", category: "DevOps", description: "Hands-on intro to containers, images and Compose.", duration: "4 hours", link: "https://docs.docker.com/get-started/", tags: ["Docker"] },
  { id: "devops-roadmap", title: "DevOps Roadmap", provider: "roadmap.sh", level: "All Levels", category: "DevOps", description: "Visual roadmap of skills, tools and order of learning.", duration: "Reference", link: "https://roadmap.sh/devops", tags: ["Roadmap"] },
  { id: "terraform-tutorials", title: "Terraform Tutorials", provider: "HashiCorp", level: "Intermediate", category: "DevOps", description: "Infrastructure as code from zero to multi-cloud.", duration: "Self-paced", link: "https://developer.hashicorp.com/terraform/tutorials", tags: ["IaC"] },
  { id: "sre-book", title: "Google SRE Book", provider: "Google", level: "Advanced", category: "DevOps", description: "Free book on running production systems at scale.", duration: "Book", link: "https://sre.google/sre-book/table-of-contents/", tags: ["SRE"] },

  // Interview Prep
  { id: "tech-interview-handbook", title: "Tech Interview Handbook", provider: "Yangshun Tay", level: "All Levels", category: "Interview Prep", description: "Curated rounds, behavioral, and negotiation guidance.", duration: "Reference", link: "https://www.techinterviewhandbook.org/", tags: ["Interview"] },
  { id: "system-design-primer", title: "System Design Primer", provider: "donnemartin", level: "Advanced", category: "Interview Prep", description: "Open-source guide to large-scale system design interviews.", duration: "Reference", link: "https://github.com/donnemartin/system-design-primer", tags: ["System Design"] },
  { id: "pramp", title: "Pramp Mock Interviews", provider: "Pramp", level: "All Levels", category: "Interview Prep", description: "Free peer-to-peer mock interviews with real engineers.", duration: "Free", link: "https://www.pramp.com/", tags: ["Mock"] },
  { id: "interviewing-io", title: "Interviewing.io Recordings", provider: "Interviewing.io", level: "All Levels", category: "Interview Prep", description: "Anonymous, real interview recordings with feedback.", duration: "Library", link: "https://interviewing.io/recordings", tags: ["Interview"] },
  { id: "behavioral-questions", title: "STAR Behavioral Guide", provider: "The Muse", level: "Beginner", category: "Interview Prep", description: "How to structure behavioral interview answers using STAR.", duration: "30 min", link: "https://www.themuse.com/advice/star-interview-method", tags: ["Behavioral"] },
  { id: "grokking-system-design", title: "Grokking System Design Basics", provider: "ByteByteGo", level: "Intermediate", category: "Interview Prep", description: "YouTube series breaking down core system design concepts.", duration: "10 hours", link: "https://www.youtube.com/@ByteByteGo", tags: ["System Design"] },
];

export const categories: ResourceCategory[] = [
  "Frontend",
  "Backend",
  "Full Stack",
  "AI/ML",
  "UI/UX",
  "DSA",
  "DevOps",
  "Interview Prep",
];

export const levels: ResourceLevel[] = ["Beginner", "Intermediate", "Advanced", "All Levels"];
