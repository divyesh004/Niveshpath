📘 Frontend Product Requirements Document (PRD)
Project Name: NiveshPath – AI-Driven Personal Finance Education Platform
Version: 1.1 (Course Removed Version)
Author: [Your Name]
Date: May 13, 2025

1. 🎯 Objective
The frontend should provide a clean, intuitive, and mobile-responsive user interface for users to:

Access and use finance tools (SIP, EMI, Budget Planner)

Interact with the AI-powered chatbot for financial advice

Complete onboarding surveys for personalization

Manage personal profiles and settings

View live data from external APIs (RBI, NSE/BSE, Currency)

2. 🛠 Technologies Used
React.js (functional components, hooks)

Tailwind CSS / Bootstrap 5 (for responsive UI)

React Router DOM (for page routing)

Axios / Fetch API (for API calls)

JWT (localStorage) for login persistence

Toastify for notifications

React Hook Form / Formik for form handling

Redux / Context API (if state becomes large)

3. 🧭 UI/UX Flow (Pages)
1. Landing Page
Overview of NiveshPath’s features: Chatbot, tools, financial insights

CTA buttons: Get Started, Login

Responsive and lightweight hero section

2. Login & Register Pages
Login with email/password, JWT storage

Register with validation and optional confirmation

3. Onboarding Survey Page
Collect user preferences:

Age, Income, Financial Goals, Risk Appetite

Multi-step form with progress bar

Data sent to backend for personalized experience

4. Dashboard
Welcome message with user's name

Summary cards:

Quick access to: SIP, EMI, Budget Planner

Recent chatbot activity

Financial insights from APIs (RBI, stock market, currency)

5. Finance Tools
SIP Calculator

Inputs: Monthly Investment, Tenure, Expected Return

Output: Maturity Amount

EMI Calculator

Inputs: Loan Amount, Interest Rate, Tenure

Output: Monthly EMI

Budget Planner

Inputs: Income and expenses

Output: Monthly savings, suggestions

6. AI Chatbot Page
Floating or full-screen chatbot interface

Handles user queries:

Financial planning, definitions, tool usage, advice

Backend integration with Mistral API or similar

Chat history stored locally or fetched via user ID

7. Profile Settings Page
Edit personal info (name, email, phone)

Change password

Notification preferences

Delete account (optional)

4. ✅ Functional Requirements
Authentication
JWT-based login/register

Logout button on dashboard

Route protection (dashboard, tools, chatbot, profile)

API Integration
Use REST APIs for:

Chatbot responses

Live stock/market data (RBI, BSE/NSE)

Currency exchange data

Axios for all API calls

Global error handling with Toastify

Tools Logic
SIP/EMI/Budget logic handled on frontend

Optionally enhanced using backend if needed

Chatbot

Chatbox UI component

Typing indicator, scrollable history

Realtime response using Mistral or other LLM

Error fallback for no response

5. 🎨 UI Design & Accessibility
Dark/Light Mode toggle

Mobile-first design (fully responsive)

Keyboard accessibility

Color contrast compliant with WCAG 2.1

Clean and minimal UI

6. 🔗 External APIs
Mistral API – AI chatbot response

RBI API – Live rates

NSE/BSE API – Stock market summaries

Currency Exchange API – USD/INR, EUR/INR etc.

7. 🧪 Testing
Unit tests: Button clicks, API responses

Integration tests: Login + Dashboard + Chatbot

Responsiveness: Tested on Chrome dev tools, real devices

Accessibility testing: Screen readers, keyboard nav

8. 🚀 Deployment
Environment variables 

9. 🔐 Security
All sensitive data via HTTPS

JWT stored in localStorage (or HttpOnly cookie if upgraded later)

Logout clears session

Input validation on forms


## 10. 🎨 UI/UX Design Guidelines

### ✅ 1. **Color Combination (Professional + Trustworthy)**

| Purpose        | Description                              | Hex Code  |
| -------------- | ---------------------------------------- | --------- |
| **Primary**    | Navy Blue (Trust)                        | `#1E2A38` |
| **Secondary**  | Teal / Mint Green (Fresh, Money-related) | `#2AB3A6` |
| **Accent**     | Sky Blue (Clean, Open)                   | `#3EC1D3` |
| **Background** | Light Grey / Off White (Minimalism)      | `#F8F9FA` |
| **Text**       | Dark Grey / Charcoal (Easy Readability)  | `#333333` |

Use these colors consistently across:

* Buttons
* Sections
* Navigation
* Charts & Icons

---

### ✅ 2. **Fonts & Typography**

| Type          | Font Options                            |
| ------------- | --------------------------------------- |
| **Headings**  | Poppins / Montserrat *(modern, clean)*  |
| **Body Text** | Roboto / Open Sans *(readable, simple)* |

**Font Sizes Example:**

```css
h1 {
  font-size: 36px;
  font-weight: 700;
}
h2 {
  font-size: 28px;
  font-weight: 600;
}
p {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
}
```

---

### ✅ 3. **Layout Guidelines**

* Use **cards or containers** to group areas like:

  * Budget Tracker
  * Expense Analysis
  * Income Overview
* Maintain **ample white space** to avoid visual clutter.
* Use **Chart.js or Recharts** for:

  * Pie charts
  * Line graphs
  * Progress indicators

🔸 *Design should follow a clean grid system and be fully responsive.*

---

### ✅ 4. **Call-to-Action (CTA) Button Styling**

```css
button {
  background-color: #2AB3A6;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  transition: 0.3s;
}

button:hover {
  background-color: #23958C;
}
```

💡 *Use CTA buttons for: "Get Started", "Calculate", "Chat Now", etc.*

---

### ✅ 5. **Dark Mode (Optional)**

If implementing a dark mode toggle:

| Element    | Dark Mode Color |
| ---------- | --------------- |
| Background | `#121212`       |
| Text       | `#E0E0E0`       |
| Accent     | `#2AB3A6`       |

Use CSS variables or a theme provider for switching themes dynamically.

---

