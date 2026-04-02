# Bug Report

## 1. Pagination uses the wrong page offset

- Expected behavior: `GET /tasks?page=1&limit=10` should return the first page of results.
- Actual behavior: page 1 skipped the first `limit` tasks because the offset was calculated as `page * limit`.
- How it was discovered: the route test for `GET /tasks?page=2&limit=1` returned the wrong task before the fix, and the service unit test made the off-by-one error obvious.
- What a fix looks like: compute the offset as `(page - 1) * limit`.

## 2. Completed tasks lose their original priority

- Expected behavior: marking a task complete should update completion state, not silently change unrelated fields.
- Actual behavior: `completeTask` rewrites `priority` to `medium` every time.
- How it was discovered: reading the service while writing completion tests showed the function mutates priority even when the caller did not request it.
- What a fix looks like: preserve the existing task fields and only update `status` and `completedAt`.