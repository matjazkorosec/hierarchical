# Hierarchical structure

Hierarchical structure is a **React & TypeScript** application designed for interactive tree visualization using **D3.js**.  
It enables users to explore hierarchical data with filtering, settings customization, and performance tracking.

---

## Installation

Follow these steps to set up the project:

### Prerequisites

- **Node.js** (v18 or higher is recommended)
- **npm** (comes with Node.js)

### Steps to Install

1. Clone the repository:

   ```bash
   git clone https://github.com/matjazkorosec/hierarchical.git
   cd hierarchical
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

---

## Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm run`**`dev`**   | Runs the app in development mode using Vite       |
| `npm run`**`build`** | Compiles TypeScript and builds the production app |

---

## Libraries

| Library          | Version | Purpose                                 |
| ---------------- | ------- | --------------------------------------- |
| **`React`**      | 18.3.1  | UI library for building user interfaces |
| **`TypeScript`** | 5.6.2   | Typed superset of JavaScript            |
| **`Vite`**       | 6.0.5   | Build tool for frontend projects        |
| **`D3.js`**      | 7.9.0   | Data visualization and tree rendering   |
| **`Radix UI`**   | 1.1.X   | UI components for modal & menu          |
| **`SASS`**       | 1.83.4  | CSS preprocessor for styling            |
| **`Lodash`**     | 4.17.21 | Utility functions for working with data |

---

## Folder Structure

```
hierarchical/
├── src/                   # Source code
│   ├── components/        # UI components
│   ├── css/               # SCSS stylesheets
│   ├── data/              # JSON data files
│   ├── models/            # Data structures for tree rendering
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # React entry point
│   └── vite.config.ts     # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies
```
