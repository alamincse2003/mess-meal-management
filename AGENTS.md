# Mess Meal Management System

## Project Overview

This is a mobile Mess Meal Management System built for managing meals,
members, bazar expenses, deposits, and monthly meal calculations.

The application is being built as a real-world production-style project
and is also being used as a React Native learning project.

---

## Tech Stack

### Mobile

- React Native
- Expo
- TypeScript

### Navigation

- Expo Router / React Navigation concepts

### API & Server State

- Axios
- TanStack Query

### Backend

- FastAPI
- Python

### Database

- PostgreSQL

---

## Development Philosophy

- Write clean, readable, maintainable code.
- Prefer simple solutions over unnecessary complexity.
- Follow production-quality patterns.
- Keep business logic separate from UI components.
- Reuse components when appropriate.
- Avoid duplicated code.
- Use TypeScript properly.
- Do not use `any` unless absolutely necessary.
- Do not introduce unnecessary libraries.

---

## Important Rule for Claude

This is a learning project.

Do not implement large features without explaining the approach first.

Before making significant changes:

1. Inspect the existing project structure.
2. Explain what needs to change.
3. Propose the implementation approach.
4. Wait for confirmation when the change is large or architectural.
5. Implement the smallest reasonable change.
6. Check for TypeScript and lint errors.
7. Explain what was changed.

Do not rewrite working code unnecessarily.

---

## React Native Guidelines

Prefer React Native components and APIs.

Use:

- View
- Text
- Pressable
- TextInput
- ScrollView
- FlatList
- Image
- Modal

Prefer `StyleSheet` or the project's established styling approach.

Keep UI components focused and reusable.

Avoid putting API calls directly inside UI components when
a service or TanStack Query hook is more appropriate.

---

## TypeScript Guidelines

Use explicit types for:

- API responses
- Component props
- Navigation parameters
- Form data
- Domain models

Prefer:

- interfaces
- type aliases
- union types
- generics

Avoid:

```ts
any;
```
