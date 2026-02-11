---
trigger: always_on
description: when working with monorepo
---

# Next JS

# General Code Style & Formatting
- Follow the Airbnb Style Guide for code formatting.
- Use kebab-case for React component file names (e.g., user-card.tsx, not userCard.tsx).
- Prefer named exports for components.

# Project Structure & Architecture
- Follow Next.js patterns and use the App Router.
- Correctly determine when to use server vs. client components in Next.js.

# Styling & UI
- Use Tailwind CSS for styling.
- Use Shadcn UI for components.

# Data Fetching & Forms
- Use Zod for validation.
- Use fetch from /packages/utils/fetch everytime you have to do one.
- All fetching has to be in RSC.
- All fetching has to pass through the middleware (/packages/api)

# Images

 - Large and main images 80 quality, 65 for small ones. 
 - Priority eager for those who are going to be above the fold at first and lazy for those who 
   are not.  
 - Decoding Sync for priority images