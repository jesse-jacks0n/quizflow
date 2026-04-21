#  QuizFlow

![QuizFlow App Screenshot](./image.png)

A modern, student-first assessment platform designed for educators to easily build, distribute, and analyze quizzes. Built with a premium, minimal SaaS aesthetic focused on seamless usability.

##  Features

- **Frictionless Student Access**: Students jump directly into tests using a simple access code. No accounts or signups required.
- **Enterprise-Grade Admin Dashboard**: A clean, modern, Stripe-inspired interface to organize subjects, craft questions, and track live results.
- **Immersive Experiences**: Features custom-built HTML5 Canvas and WebGL implementations of an organic, "breathing" particle field for the landing page hero section.
- **Real-time Analytics**: Watch submissions stream in and easily export comprehensive grade reports.
- **Typography & Design Language**: High-end visual hierarchy utilizing `Inter` for data-dense UI and `Poppins` for striking headers without reliance on heavy gradients.

##  Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Backend/DB**: [Firebase](https://firebase.google.com/)
- **Graphics**: Raw WebGL and CPU-based HTML5 Canvas APIs

##  Getting Started

First, install the dependencies:

```bash
npm install
# or
bun install
```

Configure your environment variables (add your Firebase config keys):

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

##  Architecture Highlights

- **`/app`** - Next.js App Router mapping and global CSS with inline `@theme` variables.
- **`/components`** - Core business components including the Admin Dashboard, Question Builder, multi-step Auth flows, and specialized Physics/WebGL backgrounds.
- **`/components/ui`** - Highly reusable, accessible primitives provided by shadcn/ui.
- **`/lib`** - Global types, test configurations, utilities, and Firebase hook abstractions.
