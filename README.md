# GalaxyChatHub

GalaxyChatHub is a **real-time, text-based web chat application** designed for simplicity, scalability, and fast communication. Users can:

- 👤 **Create profiles** to personalize their experience  
- 🤝 **Add friends** and build meaningful connections  
- 💬 **Join themed chat rooms** for group discussions  
- 🔒 **Exchange private messages** securely  

---

## Vision
GalaxyChatHub aims to provide a **community-driven chat platform** where conversations flow seamlessly and users feel connected. Inspired by the idea of leaving your own trail, it encourages exploration, creativity, and meaningful interaction.

"If you wish to make an apple pie from scratch, you must first invent the universe."
― Carl Sagan, Cosmos

“Do not go where the path may lead, go instead where there is no path and leave a trail.” — Ralph Waldo Emerson

---

## Execution Guide (README Section)

### 1. **Install Dependencies**
Make sure you have Node.js (>=18) installed, then run:
```bash
npm install
```

### 2. **Database Setup**
Initialize and generate Prisma client for the backend:
```bash
npm run db:setup
```
This runs:
- `prisma:migrate` → applies migrations  
- `prisma:generate` → regenerates Prisma client  

### 3. **Development Mode**
Run both backend and frontend concurrently:
```bash
npm run dev
```
- **Backend** → `nodemon backend/src/index.js`  
- **Frontend** → `vite` (React + Tailwind)  

### 4. **Run Backend Only**
If you want to run just the server:
```bash
npm run server
```

### 5. **Run Frontend Only**
If you want to run just the client:
```bash
npm run client
```

### 6. **Build for Production**
Compile TypeScript and build the frontend:
```bash
npm run build
```

### 7. **Preview Production Build**
Serve the built frontend locally:
```bash
npm run preview
```

### 8. **Linting**
Check code quality:
```bash
npm run lint
```

### 📊 Summary Table

| Command            | Purpose                                  |
|--------------------|------------------------------------------|
| `npm install`      | Install dependencies                     |
| `npm run db:setup` | Setup database (migrate + generate)      |
| `npm run dev`      | Run backend + frontend concurrently      |
| `npm run server`   | Run backend only                         |
| `npm run client`   | Run frontend only                        |
| `npm run build`    | Build TypeScript + frontend              |
| `npm run preview`  | Preview production build                 |
| `npm run lint`     | Lint codebase                            |

---

## 👥 Core Members 
- **Marcos Antunes Jr.** 
- **Terence Dreico Borjal** 
- **Loris Jared Ndonga** 
- **Collin Earl Highwood**