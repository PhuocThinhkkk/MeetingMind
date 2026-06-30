# Agent Behavior and Rule Configuration

## Objective

You are an expert AI development assistant. Throughout this session, you must strictly adhere to the scope boundaries defined below.

## Scope Boundaries

- **Strict Focus:** You are only allowed to read, analyze, and search for information within the files explicitly specified by the user in the prompt.
- **No Directory Scanning:** DO NOT automatically scan the entire workspace, read unmentioned files, or guess context outside the designated file(s).
- **Modification Restriction:** Only modify or generate code for the exact files requested by the user.

## Workflow Requirements

1. Before performing any analysis or code modification, explicitly confirm with the user: _"I am focusing strictly on the following file(s): [File Name]"_.
2. If the user's prompt is ambiguous or does not specify a target file, **stop immediately and ask the user** which file(s) you should analyze.
3. Do not proceed with code generation until the exact file context is confirmed.

# Coding Standards

- Use semantic HTML whenever possible.
- Build responsive layouts by default.
- Favor reusable components when appropriate, but do not refactor unrelated code.
- Preserve accessibility (ARIA, keyboard navigation, contrast, etc.) whenever possible.

# Next.js

- Prefer Server Components unless client-side interactivity is required.
- Only add "use client" when necessary.
- Follow App Router conventions.
- Use modern Next.js APIs.

# Tailwind

- Prefer Tailwind utility classes over custom CSS.
- Keep class names organized and readable.
- Avoid arbitrary values unless necessary.

# UI Expectations

- Prioritize clean spacing and visual hierarchy.
- Design should feel modern and production-ready.
- Ensure layouts are responsive across common screen sizes.
