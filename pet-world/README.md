# PetWorld Frontend (pet-world)

A modern React-based frontend for the PetWorld platform, built with Vite for fast development and optimized builds. This app provides a seamless shopping and management experience for pet lovers, sellers, and admins.

## Table of Contents
...
## Getting Started
1. Install dependencies:
	```bash
	npm install
	```
2. Start the development server:
	```bash
	npm run dev
	```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Development
...
## API Integration
...
## Contributing
...

---

# PetWorld Backend (Petpal-main)

A Node.js/Express backend for the PetWorld platform, providing RESTful APIs for user, product, order, and admin management. Uses MongoDB for data storage and integrates with payment and image services.

## Table of Contents
...
## Setup & Running
1. Install dependencies:
	```bash
	npm install
	```
2. Set up environment variables in `.env` (DB URI, JWT secret, etc.)
3. Start the server:
	```bash
	node server.js
	```

## API Endpoints
...
## Contributing (Backend)
...

---

For more details, see the code comments and individual folder README files (if present).
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

node_modules/