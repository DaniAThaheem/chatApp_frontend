# ChatApp Frontend


A React single-page application for ChatApp — a real-time one-on-one and group messaging platform. Built with Vite, Tailwind CSS, and Socket.IO Client, consuming the [`ChatApp-Backend`](https://github.com/DaniAThaheem/chatApp_backend) REST + WebSocket API.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [Running the Application (Development)](#running-the-application-development)
- [Production Build Instructions](#production-build-instructions)
- [Frontend Overview](#frontend-overview)
- [Authentication Flow](#authentication-flow)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)
- [Authors / Credits](#authors--credits)
- [Acknowledgements](#acknowledgements)

---

## Project Overview

This is the client application for ChatApp. It lets a logged-in user browse their chats, start new one-on-one or group conversations, and exchange text messages and file attachments in real time. Auth state and the active Socket.IO connection are managed through React Context, and all backend communication goes through a single centralized Axios client.

## Key Features

- Login and registration forms wired to the backend's JWT-based auth endpoints
- Persistent sessions via `localStorage` (user profile + access token), restored on app load
- Route guards: `PrivateRoute` (redirects unauthenticated users to `/login`) and `PublicRoute` (redirects authenticated users to `/chats`)
- Real-time chat list and message thread powered by `socket.io-client`
- Typing / stop-typing indicator support
- Create a one-on-one chat or a group chat (with participant selection) via a modal
- Send messages with text and/or file attachments (up to 5 per message)
- Delete messages, with local chat state and "last message" preview kept in sync
- Automatic logout and redirect to `/login` on `401`/`403` API responses

## Technology Stack

| Category | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| UI Components | Headless UI, Heroicons |
| HTTP Client | Axios |
| Real-time Client | `socket.io-client` |
| Date Formatting | Moment.js |
| Linting | ESLint 9 (React Hooks + React Refresh plugins) |

## Project Architecture

The app follows a context-driven architecture rather than a global store library:

- **`AuthContext`** owns the authenticated user, access token, and `login` / `register` / `logout` logic, persisting session data to `localStorage`.
- **`SocketContext`** creates and provides a single `socket.io-client` instance, authenticated using the stored access token.
- **`api/index.js`** centralizes every backend call in one module. A request interceptor automatically attaches the `Authorization` header, and `requestHandler` (in `utils/`) provides a consistent loading/success/error pattern for every API call, including a global redirect-to-login on `401`/`403`.
- **Pages** (`Login`, `Register`, `Chat`) consume these contexts and the API module.
- **Components** are split into generic building blocks (`components/basic/`) and chat-specific UI (`components/chat/`).

## Folder Structure

```
ChatApp-Frontend/
├── public/
├── src/
│   ├── api/
│   │   └── index.js              # Centralized Axios API calls
│   ├── components/
│   │   ├── basic/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   └── Select.jsx
│   │   └── chat/
│   │       ├── AddChatModal.jsx
│   │       ├── ChatItem.jsx
│   │       ├── GroupChatDetailModal.jsx
│   │       ├── MessageItem.jsx
│   │       └── Typing.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── SocketContext.jsx
│   │   ├── useAuth.js
│   │   └── useSocke.js
│   ├── pages/
│   │   ├── Chat.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── utils/
│   │   └── index.js               # classNames, LOCALSTORAGE helper, requestHandler
│   ├── App.jsx                    # Route definitions
│   └── main.jsx                   # App bootstrap & provider tree
├── .env
├── vite.config.js
└── package.json
```

## Prerequisites

- **Node.js** v18 or later and npm
- A running instance of the [ChatApp backend](https://github.com/DaniAThaheem/chatApp_backend), reachable over HTTP/WebSocket

## Installation Guide

```bash
git clone https://github.com/DaniAThaheem/chatApp_frontend.git
cd chatApp_frontend
npm install
```

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
|---|---|
| `VITE_SERVER_BASE_URI` | Base URL of the backend REST API (e.g., `http://localhost:8080/api/v1`) |
| `VITE_SOCKET_URI` | Base URL of the backend Socket.IO server (e.g., `http://localhost:8080`) |

## Running the Application (Development)

```bash
npm run dev
```

By default, Vite serves the app at `http://localhost:5173`. Make sure the backend is running and `VITE_SERVER_BASE_URI` / `VITE_SOCKET_URI` point to it.

## Production Build Instructions

```bash
npm run build      # outputs static assets to dist/
npm run preview    # locally preview the production build
```

Deploy the contents of `dist/` to any static host (Vercel, Netlify, Nginx, etc.), with `VITE_SERVER_BASE_URI` and `VITE_SOCKET_URI` pointing at your deployed backend.

## Frontend Overview

| Route | Access | Description |
|---|---|---|
| `/` | — | Redirects to `/chats` (if authenticated) or `/login` |
| `/login` | Public only | Login form |
| `/register` | Public only | Registration form |
| `/chats` | Private only | Main chat interface: chat list, message thread, new chat/group modal |
| `*` | — | Simple "Page Not Found" fallback |

**Key components:**

| Component | Responsibility |
|---|---|
| `AddChatModal` | Search users and create a one-on-one or group chat |
| `ChatItem` | Render a single chat in the sidebar list |
| `MessageItem` | Render a single message bubble |
| `Typing` | Typing indicator animation |
| `GroupChatDetailModal` | View/manage group chat details |
| `PrivateRoute` / `PublicRoute` | Auth-based route guards |

## Authentication Flow

1. On login/register, the frontend calls the backend via `api/index.js`.
2. On successful login, the returned user object and access token are stored in both React state (`AuthContext`) and `localStorage`.
3. The Axios request interceptor attaches `Authorization: Bearer <token>` to every subsequent API call.
4. `SocketContext` initializes a `socket.io-client` connection using the same stored token (sent via the socket handshake `auth` payload).
5. If any API call returns `401` or `403`, `localStorage` is cleared and the user is redirected to `/login`.
6. On app load, `AuthContext` checks `localStorage` for an existing session and restores it if present, avoiding an unnecessary re-login.

> **Note:** The access token is stored in `localStorage` rather than relying solely on the `httpOnly` cookie the backend also sets. This is simpler for attaching the token to Socket.IO's handshake `auth` payload, but it does expose the token to any script running on the page (XSS risk) — see [Future Improvements](#future-improvements).

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start the Vite development server |
| `npm run build` | `vite build` | Create a production build in `dist/` |
| `npm run preview` | `vite preview` | Preview the production build locally |
| `npm run lint` | `eslint .` | Run ESLint across the project |

## Configuration

- **Styling:** Tailwind CSS v4, configured through `@tailwindcss/postcss` in `postcss.config.mjs`.
- **Linting:** ESLint flat config (`eslint.config.js`) with React Hooks and React Refresh plugins.
- **Vite:** minimal config (`vite.config.js`) using `@vitejs/plugin-react` for Fast Refresh — no path aliases or proxy rules are configured.

## Deployment Guide

1. Set `VITE_SERVER_BASE_URI` and `VITE_SOCKET_URI` to your deployed backend's URL.
2. Run `npm run build` to generate the `dist/` folder.
3. Deploy `dist/` to a static host (Vercel, Netlify, S3 + CloudFront, Nginx, etc.).
4. Ensure the backend's `CORS_ORIGIN` is set to this frontend's deployed URL, and that the backend is served over HTTPS (required for `secure` cookies to be honored by browsers).

## Troubleshooting

| Issue | Likely Cause | Fix |
|---|---|---|
| Blank page / API calls fail | `VITE_SERVER_BASE_URI` not set or incorrect | Double-check the `.env` file and restart the Vite dev server (env vars are read at startup) |
| Socket never connects | `VITE_SOCKET_URI` mismatch or backend CORS misconfigured | Confirm the backend's `CORS_ORIGIN` matches this app's origin exactly |
| Logged out immediately after login | Backend cookies blocked (mixed HTTP/HTTPS, or `secure` cookie over plain HTTP in production) | Serve both frontend and backend over HTTPS in production |
| Changes to `.env` not taking effect | Vite only reads env vars at server start | Restart `npm run dev` after editing `.env` |

## Future Improvements

- Move the access token out of `localStorage` to reduce XSS exposure (rely on the `httpOnly` cookie alone, or use a short-lived in-memory token)
- Add loading and error UI states beyond the current `alert()`-based error handling
- Persist unread message counts across sessions/devices instead of only in local component state
- Add automated tests (none currently exist)
- Add TypeScript or PropTypes for stronger type safety across components

## Contributing Guidelines

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`
2. Follow the existing ESLint configuration (`npm run lint` before committing)
3. Commit with clear, descriptive messages
4. Open a pull request describing the change and its motivation
5. Verify the app still works end-to-end against a running backend before submitting

## License

No `LICENSE` file or `license` field was found in this repository's `package.json`. Licensing terms are currently unspecified — add a `LICENSE` file to clarify usage rights.

## Authors / Credits

**Danish A.** ([@DaniAThaheem](https://github.com/DaniAThaheem)) — project author.

## Acknowledgements

- [Headless UI](https://headlessui.com/) and [Heroicons](https://heroicons.com/) for accessible, unstyled UI primitives
- [Socket.IO](https://socket.io/) for the real-time client
