@AGENTS.md

# Claude Code

- Follow links from the imported guide just in time. Do not preload the entire
  corpus before classifying the task.
- Use subagents for bounded evidence gathering and independent review. Keep the
  main thread responsible for decisive source reading, application,
  verification, and task closure.
- Treat auto memory as local scratch state. Prefer the target system and this
  corpus's cited sources when establishing facts.