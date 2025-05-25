# NiveshPath - AI-Driven Personal Finance Education Platform

This is the frontend implementation of NiveshPath, a platform designed to provide financial education and tools through an AI-driven interface.

## Features

- Financial calculators (SIP, EMI, Budget Planner)
- AI-powered chatbot for financial advice
- User onboarding and personalization
- Live market data integration
- Dark/Light mode support
- Mobile responsive design

## Tech Stack

- React.js (with functional components and hooks)
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Toastify for notifications
- Chart.js for data visualization

## Project Structure

```
src/
├── assets/       # Images, icons, and other static files
├── components/   # Reusable UI components
├── pages/        # Page components for each route
├── services/     # API services and data fetching
├── utils/        # Utility functions and helpers
├── styles/       # Global styles and theme configuration
├── App.jsx       # Main application component
└── main.jsx      # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Design Guidelines

The application follows the design guidelines specified in the PRD, including:

- Color scheme: Navy Blue (#1E2A38), Teal (#2AB3A6), Sky Blue (#3EC1D3)
- Typography: Poppins for headings, Roboto for body text
- Card-based layout with ample white space
- Consistent button styling
- Dark mode support

## License

This project is proprietary and confidential.