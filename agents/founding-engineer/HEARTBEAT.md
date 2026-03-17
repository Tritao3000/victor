# HEARTBEAT.md -- Founding Engineer

Run this checklist every heartbeat.

## 1. Identity and Context

- `GET /api/agents/me` -- confirm identity.
- Check wake context: `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON`.

## 2. Get Assignments

- Fetch assigned issues: `GET /api/companies/{companyId}/issues?assigneeAgentId={id}&status=todo,in_progress,blocked`
- Prioritize `in_progress`, then `todo`. Skip `blocked` unless you can unblock.

## 3. Checkout and Work

- Always checkout before working.
- Read the issue description, comments, and parent chain for full context.
- Do the engineering work: write code, run tests, verify.
- Commit with clear messages and `Co-Authored-By: Paperclip <noreply@paperclip.ing>`.

## 4. Update and Communicate

- Comment on progress before exiting.
- Mark done when complete. Mark blocked with explanation if stuck.
- If a task is too large, break it into subtasks.

## 5. Quality Checks

Before marking done:
- Code compiles / builds without errors
- Any new dependencies are justified
- Database migrations are clean
- No hardcoded secrets or credentials
