# HRM FrontEnd Project

## Project Description
**HRM_FrontEnd** is a modern Human Resource Management interface built with **Next.js (App Router)**. The project is designed with a modular architecture, focusing on scalability and performance. It features a clean separation between public-facing pages and administrative HRM modules, utilizing **Redux** for robust state management.

---

## Project Structure

The project follows a standardized Next.js directory structure:

```text
src/
├── app/                  # Next.js App Router (Routing & Pages)
│   ├── (hrm)/            # Route Group: HRM Admin/Internal pages
│   ├── (public)/         # Route Group: Public pages (Home, Contact, etc.)
│   ├── layout.jsx        # Root layout for the application
│   └── globals.css       # Global styles
├── assets/               # Static assets (Fonts, SCSS, Images)
├── components/           # Reusable React components
├── constants/            # Configuration files and constant variables
├── contexts/             # React Context API definitions
├── hooks/                # Custom React Hooks
├── lib/                  # Third-party library configs and utility functions
├── redux/                # Global State Management (Store & Slices)
└── services/             # API service layers (Axios/Fetch calls)
```

## Getting started
If you are new to web development or haven't run a Node.js project before, follow these steps:

1. Install Node.js
Visit the official website: nodejs.org

Download and install the LTS version (Recommended for most users).
2. Clone the Repository

3. Install Dependencies
Navigate to the project folder (HRM_FrontEnd) in your terminal and run this comand
```
npm install
```
4. Run the Development Server
Start the project locally by running:

```
npm run dev
```
Open your browser and go to: http://localhost:3000
