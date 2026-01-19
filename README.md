# 📚 DocuHelper - Dynamic Documentation AI Assistant

> **Real-time RAG (Retrieval-Augmented Generation) powered documentation assistant that provides instant, accurate answers from your knowledge base.**

![Astro](https://img.shields.io/badge/Astro-5.16.11-orange?style=flat-square&logo=astro)
![React](https://img.shields.io/badge/React-18.3.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.14-38B2AC?style=flat-square&logo=tailwind-css)

---

## ✨ Features

### 🤖 AI-Powered Query System
- **Semantic Search** - Context-aware document retrieval using vector embeddings
- **RAG Architecture** - Retrieval-Augmented Generation for accurate, grounded responses
- **OpenAI Integration** - GPT-4o-mini for intelligent answer generation
- **Google AI Support** - Gemini API integration ready
- **Real-time Processing** - Instant query responses with processing time metrics

### 📄 Document Management
- **Multi-format Support** - Upload .txt, .md, .json, .csv files
- **Drag & Drop Upload** - Intuitive file upload interface
- **Automatic Indexing** - Documents are chunked and vectorized automatically
- **Document Preview** - View document contents before querying
- **Real-time Sync** - Changes reflected instantly in search results

### 🔍 Smart Search
- **Vector Similarity** - Cosine similarity for accurate document matching
- **Relevance Scoring** - See how well documents match your query
- **Source Attribution** - Know exactly which documents informed the answer
- **Context Building** - Intelligent context assembly from multiple sources

### 📊 Query History
- **Full History** - Track all past queries and responses
- **Feedback System** - Rate responses for quality improvement
- **Search & Filter** - Find previous queries easily
- **Export Capability** - Download your query history

### ⚙️ Settings & Configuration
- **API Key Management** - Securely store OpenAI and Google API keys
- **Model Selection** - Choose between GPT-4o-mini, GPT-4o, GPT-4 Turbo
- **Temperature Control** - Adjust response creativity (0-1 scale)
- **Performance Tuning** - Configure caching and processing options

### 🎨 Modern UI/UX
- **Clean Design** - Minimalist, professional interface
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Mode Ready** - Prepared for theme switching
- **Smooth Animations** - Framer Motion powered transitions
- **Accessible** - ARIA labels and keyboard navigation

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Astro 5.16.11 with SSR |
| **Frontend** | React 18.3.0 |
| **Language** | TypeScript 5.8.3 |
| **Styling** | Tailwind CSS 3.4.14 |
| **UI Components** | Radix UI + shadcn/ui |
| **Animations** | Framer Motion |
| **Routing** | React Router DOM 7.4.1 |
| **AI/ML** | OpenAI API, Google AI |
| **State** | React Hooks + LocalStorage |
| **Testing** | Vitest |
| **Build** | Vite |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API Key (for AI features)
- Google API Key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ABHISHEKABHI52/Docu-query-main.git
   cd Docu-query-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:4321
   ```

---

## 🖥️ Execution Instructions

### 💻 Running Locally (Step-by-Step)

```bash
# Step 1: Clone the repository
git clone https://github.com/ABHISHEKABHI52/Docu-query-main.git

# Step 2: Navigate to project folder
cd Docu-query-main

# Step 3: Install all dependencies
npm install

# Step 4: Start development server
npm run dev

# Step 5: Open browser at http://localhost:4321
```

### 🏗️ Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### 🧪 Run Tests

```bash
npm run test
```

### 🔍 Lint Code

```bash
npm run lint
```

### ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 4321 in use | Server auto-switches to 4322. Check terminal output. |
| `npm install` fails | Delete `node_modules` folder and run `npm install` again |
| API not working | Check `.env` file has correct API keys |
| Module not found | Run `npm install` to ensure all dependencies are installed |

### 🔑 API Keys Setup

1. **OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Add to `.env` as `PUBLIC_OPENAI_API_KEY=sk-...`

2. **Google API Key (Optional):**
   - Go to https://console.cloud.google.com
   - Create credentials → API Key
   - Add to `.env` as `PUBLIC_GOOGLE_API_KEY=AIza...`

---

## 📁 Project Structure

```
docu-query/
├── src/
│   ├── components/
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── ui/             # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Router.tsx
│   ├── services/
│   │   ├── ai-service.ts       # RAG & AI logic
│   │   ├── document-service.ts # Document processing
│   │   └── index.ts
│   ├── hooks/              # Custom React hooks
│   ├── pages/
│   │   ├── api/            # API routes
│   │   └── [...slug].astro # Catch-all route
│   └── styles/             # Global styles
├── integrations/           # Service integrations
├── public/                 # Static assets
├── .env                    # Environment variables
└── package.json
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

---

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/query` | POST | Submit a query to the RAG system |
| `/api/documents` | GET | List all documents |
| `/api/documents` | POST | Upload a new document |
| `/api/documents` | DELETE | Delete a document |

---

## 🎯 How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload     │────▶│   Process    │────▶│   Embed &    │
│  Documents   │     │   & Chunk    │     │    Index     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Display    │◀────│   Generate   │◀────│   Retrieve   │
│   Answer     │     │   Response   │     │   Context    │
└──────────────┘     └──────────────┘     └──────────────┘
                            ▲
                            │
                     ┌──────────────┐
                     │  User Query  │
                     └──────────────┘
```

1. **Document Ingestion** - Upload documents in supported formats
2. **Processing** - Documents are chunked into smaller segments
3. **Embedding** - Each chunk is converted to vector embeddings
4. **Indexing** - Vectors are stored for fast similarity search
5. **Query** - User asks a question
6. **Retrieval** - Most relevant document chunks are retrieved
7. **Generation** - AI generates answer using retrieved context
8. **Response** - User receives accurate, sourced answer

---

## 🔐 Security

- 🔒 API keys stored locally in browser (never sent to external servers)
- 🔒 All data persisted in localStorage (privacy-first)
- 🔒 No telemetry or tracking
- 🔒 Open source and auditable

---

## 📈 Performance

- ⚡ Sub-second query responses
- ⚡ Efficient vector similarity search
- ⚡ Smart caching for repeated queries
- ⚡ Lazy loading for large document sets

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Thanks to Our Amazing Team

A huge thank you to everyone who contributed to making DocuHelper possible! 🎉

### 👨‍💻 Core Team

| 🧑‍💼 Role | 👤 Name | 💡 Contribution |
|----------|---------|-----------------|
| 🎯 **Project Lead** | Abhishek | Vision, Architecture & Development |
| 🤖 **AI Engineer** | Team Member | RAG System & AI Integration |
| 🎨 **UI/UX Designer** | Team Member | Beautiful Interface Design |
| 💻 **Frontend Dev** | Team Member | React Components & Animations |
| 🔧 **Backend Dev** | Team Member | API Routes & Services |
| 🧪 **QA Engineer** | Team Member | Testing & Quality Assurance |

### 🌟 Special Thanks

- 💜 **OpenAI** - For providing the powerful GPT models
- 💚 **Google** - For AI and cloud services
- 🔵 **Astro Team** - For the amazing framework
- ⚛️ **React Team** - For the awesome UI library
- 🎨 **Tailwind Labs** - For the beautiful styling system
- 🧩 **Radix UI** - For accessible components
- 🎬 **Framer** - For smooth animations

### 💖 Community

Thank you to all the developers, designers, and users who provided feedback and suggestions! Your input made this project better. 🙌

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ by Team Solution Squad**

🚀 *Building the future of documentation, one query at a time* 🚀

---

[🏠 Home](/) | [📄 Documents](/documents) | [📜 History](/history) | [⚙️ Settings](/settings)

</div>
