# Security Specification - Shalom Alkaline

## Data Invariants
1. A post must have a valid authorId matching the authenticated user.
2. Upvotes and downvotes are unique lists of user IDs.
3. Users can only edit their own profile and posts.
4. Admins have overarching modify permissions (except for critical identity fields).
5. Chat participants must be members of the chat to send/read messages.
6. Follows must have valid followerId and followingId.

## The "Dirty Dozen" Payloads (Target: PERMISSION_DENIED)
1. **Identity Spoofing**: Creating a post with another user's `authorId`.
2. **Ghost Field Injection**: Adding `isAdmin: true` to a standard user profile update.
3. **State Shortcutting**: Updating a post's `createdAt` timestamp manually.
4. **Unauthenticated Read**: Attempting to read private chat messages without being logged in.
5. **Cross-User Edit**: User A attempting to update User B's bio.
6. **Malicious ID**: Using a 1MB string as a `postId`.
7. **Bypassing Membership**: Sending a message to a chat the user is not a participant of.
8. **Negative Votes**: Attempting to set `upvotes` to a negative number (it's a list, but testing type safety).
9. **Spamming**: Creating a post with a 1MB content string.
10. **Admin Escalation**: A non-admin user creating a document in an `admins` collection (if it existed) or setting their own `isAdmin` flag.
11. **Orphaned Comment**: Creating a comment on a non-existent `postId`.
12. **Double Vote**: Attempting to have the same UID in both `upvotes` and `downvotes` (logic check).

## Rules Draft
(I will now generate the firestore.rules file)
