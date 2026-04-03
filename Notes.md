**Thing that surprised me in the codebase**

*i* Pagination had an off-by-one bug (page * limit instead of (page - 1) * limit), which is easy to miss without tests.
*ii* Completing a task was mutating an unrelated field (priority) instead of only completion-related fields.
*iii* Input validation existed but many invalid branches were initially untested, so behavior looked safer than it actually was.
*iv*The API is clean and small, but because it uses in-memory state, subtle logic issues can hide until route-level and service-level tests are both in place.

**Questions I’d ask before shipping to production**

*1* Should assignee history be kept, or is overwriting assignment always acceptable?
*2* What is the expected behavior for pagination with invalid values (page=0, negative numbers, non-numeric strings)?
*3* Should status filtering require exact matches only, or partial matches by design?
*4* Do we need request-level validation for unknown fields to prevent accidental schema drift?
*5* What are the requirements for persistence, since in-memory storage loses all data on restart?
*6* Are there authentication/authorization rules needed before exposing create/update/delete/assign endpoints publicly?