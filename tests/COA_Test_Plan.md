# COA — Test Plan
**Campus Opportunity Aggregator · V1**  
Manual QA checklist. Every item is a discrete pass/fail check.  
Mark each: ✅ Pass · ❌ Fail (note actual behavior) · ⏭ Skip (note reason)

---

## Legend
| Symbol | Meaning |
|--------|---------|
| [S] | Student role |
| [A] | Admin role |
| [O] | Organisation role |
| [SYS] | System / background job |
| [UI] | Frontend behavior only |
| [E2E] | Full flow across roles |

---

## 1. Authentication

### 1.1 Signup
| # | Test | Expected |
|---|------|----------|
| 1.1.1 | Submit signup form with valid name, email, password | Account created. "Check your email" success state shown. No redirect. |
| 1.1.2 | Submit with empty name | Name field error. No submission. |
| 1.1.3 | Submit with invalid email format | Email field error. No submission. |
| 1.1.4 | Submit with password < 8 characters | Password error. No submission. |
| 1.1.5 | Submit with mismatched confirm password | Confirm field error. Submit blocked. |
| 1.1.6 | Submit with an already-registered email | 409 error. Inline message: "Email already registered. Log in instead?" |
| 1.1.7 | Type a valid email and blur the field | "Checking availability…" spinner appears, then "Email is available" |
| 1.1.8 | Navigate to /signup while already logged in | Redirect to /app/feed (student) or /admin (admin) |
| 1.1.9 | Submit form, then check inbox for verification email | Email received within ~60s with a working link |
| 1.1.10 | Click the verification link | isEmailVerified set. Redirect to /onboarding |
| 1.1.11 | Click the same verification link a second time | Link rejected / expired. No crash. Error message shown. |
| 1.1.12 | Wait 25 hours and click a verification link | Link expired. Toast or error message shown. |

### 1.2 Login
| # | Test | Expected |
|---|------|----------|
| 1.2.1 | Login with correct student credentials | JWT stored. Redirect to /app/feed |
| 1.2.2 | Login with correct admin credentials | Redirect to /admin/listings |
| 1.2.3 | Login with correct org credentials | Redirect to /org/listings |
| 1.2.4 | Login with wrong password | 401. Toast: "Incorrect email or password." |
| 1.2.5 | Login with unverified email | 403. Inline banner with "Resend verification email" link |
| 1.2.6 | Click "Resend verification email" in banner | Loading state on button. Success: banner text changes to "Email sent!" |
| 1.2.7 | Login with suspended account | Toast: "Your account has been suspended." No access granted. |
| 1.2.8 | Submit login form with both fields empty | Both fields show error state simultaneously |
| 1.2.9 | Navigate to /login while already logged in | Redirect to role-appropriate home |
| 1.2.10 | Manually delete JWT from localStorage and navigate to /app/feed | Redirect to /login |

### 1.3 Route Guards
| # | Test | Expected |
|---|------|----------|
| 1.3.1 | Access /app/feed with no JWT | Redirect to /login |
| 1.3.2 | Access /admin/listings as a student | Redirect to /app/feed. Toast: "You don't have access to that page." |
| 1.3.3 | Access /org/listings as a student | Redirect to /app/feed |
| 1.3.4 | Access /app/feed with onboardingComplete:false | Redirect to /onboarding |
| 1.3.5 | Access /onboarding with onboardingComplete:true | Redirect to /app/feed |
| 1.3.6 | Access any /app/* route with an expired JWT | Redirect to /login. Toast: "Session expired." |

---

## 2. Onboarding

| # | Test | Expected |
|---|------|----------|
| 2.1 | Complete onboarding step 1 with branch + year selected | Step progress indicator advances. Step 2 slides in. |
| 2.2 | Try to click Continue on step 1 with nothing selected | Continue button disabled. No advance. |
| 2.3 | Select a branch on step 1, leave year empty | Continue still disabled. |
| 2.4 | On step 2, select 5 tags | All 5 selected. Counter shows "5 of 5". |
| 2.5 | Try to select a 6th tag | All remaining chips go faded/disabled. Selection capped. |
| 2.6 | Deselect a tag when at max | One chip deselects. Other chips become interactive again. |
| 2.7 | Complete step 2 with 0 tags selected | Continue is still enabled. No minimum enforced. |
| 2.8 | Complete step 3 and click "Start exploring" | PUT /api/user/onboarding called. Redirect to /app/feed. Toast: "Welcome!" |
| 2.9 | Refresh the page mid-onboarding (e.g., on step 2) | Return to step 2 with step 1 data preserved (sessionStorage). |
| 2.10 | Click Back on step 2 | Returns to step 1. Step 1 values still populated. |
| 2.11 | Step 3 complete API fails | Toast: "Something went wrong." Button reverts. User stays on step 3. |
| 2.12 | Tag list fails to load on step 2 | Error message with "Try again" button. Continue still enabled. |

---

## 3. Main Feed [S]

### 3.1 Loading
| # | Test | Expected |
|---|------|----------|
| 3.1.1 | Open /app/feed for the first time | Skeleton cards appear in all sections immediately. Replaced by real content when data resolves. |
| 3.1.2 | Three API calls fire in parallel on load | Confirmed via network tab: feed/sections, activity/summary, notifications/unread-count all fire simultaneously. |
| 3.1.3 | Simulate feed API failure (throttle/block network) | Error state with "Retry" button replaces skeleton cards. |

### 3.2 Sections
| # | Test | Expected |
|---|------|----------|
| 3.2.1 | Listings with deadline within 7 days appear in Closing Soon | Cards visible with "X days left" deadline text. |
| 3.2.2 | Ignored listings do not appear in Closing Soon | Ignored listing absent even if deadline < 7 days. |
| 3.2.3 | Closing Soon is empty when no listings qualify | Inline "No listings closing soon" text. Section takes no space. |
| 3.2.4 | Recommended section shows listings matching user's year + branch | All shown cards match the user's eligibility. |
| 3.2.5 | Listings already saved/applied/ignored are absent from Recommended | None of the user's activity listings appear in Recommended. |
| 3.2.6 | Don't Miss section shows only priority:dont-miss listings | No normal or high-priority listings in this section. |
| 3.2.7 | Don't Miss is fully hidden when empty | No section header or empty state shown. Section does not render at all. |
| 3.2.8 | Browse All filter by domain | Only listings with that domain tag appear. Result count updates. |
| 3.2.9 | Browse All filter by type | Only listings of that type appear. |
| 3.2.10 | Combine two filters | Results satisfy both conditions (AND logic). |
| 3.2.11 | Apply filter → refresh page | Filters restored from URL query params. Same results shown. |
| 3.2.12 | Clear all filters | All listings shown again. Result count resets. Clear button disappears. |
| 3.2.13 | Browse All "Load more" | Next page of results appends below. Button reappears if more pages exist. Disappears when last page reached. |

### 3.3 Card Interactions
| # | Test | Expected |
|---|------|----------|
| 3.3.1 | Tap Save on a listing card | Bookmark icon fills immediately (optimistic). POST /api/activity fires. Tracking strip "Saved" count increments. |
| 3.3.2 | Block the save API call and tap Save | Optimistic update rolls back (icon reverts). Error toast shown. |
| 3.3.3 | Tap Save on an already-saved card | Icon reverts to outline (unsave). Activity record deleted. Count decrements. |
| 3.3.4 | Tap Ignore on a listing card | Card collapses with slide-up + fade animation. Removed from view. |
| 3.3.5 | Tap Ignore on a card in Closing Soon | Card disappears. Does not reappear in Recommended or Closing Soon. |
| 3.3.6 | Tap card body | Navigates to /app/listing/:id. Save/Ignore buttons do not navigate (propagation stopped). |
| 3.3.7 | Long listing title | Clamped to 2 lines with ellipsis. Full title visible in tooltip on hover. |
| 3.3.8 | Broken orgLogoUrl | Initials avatar renders immediately. No broken image icon visible. |
| 3.3.9 | dont-miss card | Priority banner visible at top of card. Badge has 2 pulse cycles on appear. |
| 3.3.10 | Listing with deadline ≤ 2 days | Deadline text shows in red. |
| 3.3.11 | Listing with deadline 3–7 days | Deadline text shows in amber. |

---

## 4. Listing Detail [S]

| # | Test | Expected |
|---|------|----------|
| 4.1 | Open a listing with all fields populated | All sections render: header, status, action bar, description, timeline, eligibility, source, flag button, external link. |
| 4.2 | Open a listing with no deadline set | Timeline card shows "No deadline set". Prep suggestion absent. |
| 4.3 | Open a listing with confirmed deadline | Confidence chip shows "Confirmed". |
| 4.4 | Open a listing with only lastDeadline (no current deadline) | Confidence chip shows "Based on [year] data" or "Approximate — [year] data". |
| 4.5 | Hover confidence chip | Tooltip appears explaining what the label means. |
| 4.6 | Open a listing where student is eligible | "You appear eligible" with green checkmark shown. |
| 4.7 | Open a listing where student's year doesn't match | "Check eligibility" with amber warning shown. |
| 4.8 | Open a listing with targetAudience arrays empty | "Open to all students" shown. |
| 4.9 | Tap Save on listing detail | Action bar transitions to saved state. Mark Applied button appears. |
| 4.10 | Tap Mark Applied | Status transitions to applied. Notes textarea fades in. |
| 4.11 | Type in notes textarea | Notes autosave after 500ms pause. "Saving…" → "Saved ✓" indicator appears. |
| 4.12 | Scroll past action bar on mobile | Action bar sticks to bottom of viewport. |
| 4.13 | Tap Ignore | Action bar shows "Ignored. [Undo]" for 5s. Then neutral state. Listing absent from feed on return. |
| 4.14 | Open a listing with guideId set | "Prep guide available" banner visible. Clicking navigates to /app/guide/:id. |
| 4.15 | Open a listing with no guideId | Prep guide banner absent. |
| 4.16 | Tap "Report an issue" | Flag modal opens. |
| 4.17 | Submit flag with issueType selected | DataFlag created. Modal closes. Toast: "Thanks for reporting." Flag button becomes "Reported" and disables. |
| 4.18 | Submit flag with no issueType selected | Error on issueType field. Submission blocked. |
| 4.19 | Tap external link button | Opens externalUrl in a new tab. |
| 4.20 | Open listing with no externalUrl | External link button disabled. Tooltip: "No external link available." |
| 4.21 | Navigate to /app/listing/invalid-id | 404 state: illustration + "This listing doesn't exist or has been removed." + "Back to feed" button. |
| 4.22 | Open a cancelled listing the user has saved | Page renders. Prominent "Cancelled" banner at top. All action buttons disabled. |
| 4.23 | Open a closed listing with no activity | Redirect to feed. Toast: "This opportunity has closed." |
| 4.24 | Description with Markdown (headers, bold, links, lists) | All elements render correctly. Links open in new tab with external icon. |

---

## 5. Annual Calendar [S]

| # | Test | Expected |
|---|------|----------|
| 5.1 | Open /app/calendar | Page loads. Current month is scrolled to / highlighted. Skeleton chips shown during load. |
| 5.2 | Listing with openDate in March | Green chip appears in March column. |
| 5.3 | Listing with deadline in April | Amber chip appears in April column. |
| 5.4 | Tap a listing chip | Navigate to /app/listing/:id. |
| 5.5 | Toggle "My Interests" filter | Only listings matching user's saved domain tags remain. Non-matching chips fade out. |
| 5.6 | Toggle back to "All Listings" | All chips reappear. |
| 5.7 | Month with > 6 chips | Shows 6 chips + "+N more" chip. |
| 5.8 | Tap "+N more" | Month expands. Additional chips fade in. Chip changes to "Show less". |
| 5.9 | Month with no listings | Shows "No listings" in muted text. Month still visible. |
| 5.10 | "My Interests" with 0 interests set | Prompt shown: "You haven't set any interests." CTA to settings. |

---

## 6. Tracking Dashboard [S]

| # | Test | Expected |
|---|------|----------|
| 6.1 | Open /app/dashboard with saved + applied + missed activity | All three metric cards show correct counts. Activity list populated. |
| 6.2 | Tap "Saved" metric card | List filters to saved only. Active card gets accent border. URL updates to ?status=saved. |
| 6.3 | Tap "Saved" again | Filter clears. All statuses shown. |
| 6.4 | Tap "Mark Applied" on a saved row | Row status badge transitions saved → applied. Applied count increments. Saved count decrements. |
| 6.5 | Tap remove (×) on a saved row | Row collapses. Undo toast appears for 5s. Count decrements. |
| 6.6 | Tap Undo within 5s | Row reappears with slide-down animation. Count restored. |
| 6.7 | Tap row title | Navigate to /app/listing/:id. |
| 6.8 | Missed rows | Muted appearance (0.7 opacity). Missed badge. No action buttons. Cannot be removed. |
| 6.9 | Listing removed after being saved (admin deleted it) | Row shows "[Listing removed]" placeholder. Remove button still available. |
| 6.10 | Zero activity across all tabs | Empty state: "Start saving opportunities…" + "Go to feed" CTA. |

---

## 7. Notifications [S]

| # | Test | Expected |
|---|------|----------|
| 7.1 | Open /app/notifications with unread items | Unread items have distinct background. Dot visible. Title bold. |
| 7.2 | Tap an unread notification | Marks read (dot disappears). Navigates to payload.actionUrl. Badge decrements. |
| 7.3 | Tap a read notification | Navigates to payload.actionUrl only. No badge change. |
| 7.4 | Tap "Mark all read" | All dots disappear. All backgrounds clear. Badge resets to 0. |
| 7.5 | Switch to "Unread" tab | Only unread notifications shown. Count in tab label. |
| 7.6 | Switch back to "All" tab | All notifications shown, grouped by date. |
| 7.7 | No notifications at all | Empty state illustration with "You're all caught up!" |
| 7.8 | deadline_3day notification display | Clock icon + correct title + "Don't forget to apply" message. |
| 7.9 | dont_miss notification display | Flame icon + correct title. |
| 7.10 | cancelled notification display | X-circle icon (red) + correct title. |

---

## 8. Profile Settings [S]

| # | Test | Expected |
|---|------|----------|
| 8.1 | Change name and save | PUT /api/user/profile. Toast: "Profile updated." Dirty indicator clears. |
| 8.2 | Change branch and save | Same as above. |
| 8.3 | Change current year and save | Same as above. |
| 8.4 | Change profile field → navigate away | Confirm Dialog: "You have unsaved changes. Discard?" |
| 8.5 | Update interests (add a tag) | Auto-saves after 800ms. "Saving…" → "Saved ✓" shown. |
| 8.6 | Update interests (remove a tag) | Same auto-save behavior. |
| 8.7 | Toggle off a notification preference | Auto-saves after 300ms. "Saved ✓" micro-indicator appears. |
| 8.8 | Toggle email notifications off | Toggle saves. Next notification for this user should not send email. |
| 8.9 | Open Change Password modal | Modal opens. Three fields: Current, New, Confirm. |
| 8.10 | Submit Change Password with wrong current password | Inline error: "Current password is incorrect." |
| 8.11 | Submit Change Password with mismatched new/confirm | Confirm field error. Submit blocked. |
| 8.12 | Submit Change Password successfully | Modal closes. Toast: "Password changed successfully." |
| 8.13 | Click Log out | JWT cleared. Navigate to /login. Toast: "You've been logged out." |

---

## 9. Prep Guide [S]

| # | Test | Expected |
|---|------|----------|
| 9.1 | Open /app/guide/:id for a published guide | Title and Markdown content render correctly. |
| 9.2 | Open /app/guide/:id for an unpublished guide | 404 screen. |
| 9.3 | Open /app/guide/:id for a non-existent ID | 404 screen. |
| 9.4 | Guide with linkedListings | "Related Opportunities" section shows compact listing cards. |
| 9.5 | Guide with no linkedListings | "Related Opportunities" section absent. |
| 9.6 | Markdown with a hyperlink | Renders underlined. Opens in new tab. External link icon appended. |
| 9.7 | Markdown with raw HTML | HTML stripped. Not rendered. |
| 9.8 | Navigate back from guide | Returns to previous page (not hardcoded to feed). |

---

## 10. Admin — Listing Manager [A]

| # | Test | Expected |
|---|------|----------|
| 10.1 | Open /admin/listings | Full listing table loads with all columns visible. |
| 10.2 | Filter by status: open | Only open listings shown. Result count updates. |
| 10.3 | Filter by priority: dont-miss | Only dont-miss listings shown. |
| 10.4 | Filter: Curated only | Only listings with isCurated:true shown. |
| 10.5 | Filter: Stale only | Only listings with isStale:true shown. |
| 10.6 | Combine status + stale filters | Results satisfy both (AND logic). |
| 10.7 | Stale listing cell for lastVerifiedAt | Cell background is red for stale listings. |
| 10.8 | Click a table row | Navigate to /admin/listings/:id. |
| 10.9 | Click "New Listing" | Navigate to /admin/listings/new. Empty curation panel. |
| 10.10 | Select multiple rows via checkboxes | Bulk action bar appears: "N selected" + bulk action buttons. |
| 10.11 | Bulk "Mark stale" | All selected listings get isStale:true. Table updates. |
| 10.12 | Clear all filters | All listings shown. Result count reflects total. |
| 10.13 | Search / type in search field | Debounced 300ms. Results filter by title. |

---

## 11. Admin — Curation Panel [A]

### 11.1 Core Edit & Save
| # | Test | Expected |
|---|------|----------|
| 11.1.1 | Open existing listing | All fields populated with current values. Version number shown (e.g., "v3"). |
| 11.1.2 | Change a field | "• Unsaved changes" indicator appears in header and footer. |
| 11.1.3 | Click Save with valid data | PUT /api/admin/listings/:id. Toast: "Listing saved." Version increments. Dirty indicator clears. |
| 11.1.4 | Click Save with required field empty | Accordion containing error opens. Field shows error state. |
| 11.1.5 | Open same listing in two tabs, save from tab 2 first, then save from tab 1 | Tab 1 save returns 409. Toast: "Modified by someone else. Reload to see changes." Form data preserved. |
| 11.1.6 | Click Discard changes | Form reverts to last-saved values. Dirty indicator clears. |

### 11.2 Field Behaviors
| # | Test | Expected |
|---|------|----------|
| 11.2.1 | Edit deadline field | confidenceLevel badge updates live in Timeline section. |
| 11.2.2 | Set deadline to a date in the future | confidenceLevel shows "Confirmed". |
| 11.2.3 | Clear deadline, set only lastDeadline | confidenceLevel shows "Estimated" or "Approximate" based on age. |
| 11.2.4 | Clear all timeline fields | confidenceLevel shows null / empty. |
| 11.2.5 | Enter description > 100 chars | Auto-tag suggestion banner appears with suggested tags. |
| 11.2.6 | Click "Add all" in auto-tag banner | Suggested tags added to domainTags picker. |
| 11.2.7 | Set priority to dont-miss | Info banner appears: "Saving will immediately notify users." |
| 11.2.8 | Set status to cancelled | Amber warning banner appears in Status section before saving. |
| 11.2.9 | Save with status=cancelled | Confirm Dialog fires: "This will notify N users." Proceed → save. Notifications dispatched. |
| 11.2.10 | Toggle isCurated to true | Toggle state persists in save. No auto-revoke on subsequent edits. |
| 11.2.11 | Click "Mark as Verified" | lastVerifiedAt updates to now. Shown as "Last verified: [current date/time]". |
| 11.2.12 | Listing never verified | Shows "Never verified" in amber. |

### 11.3 Cycle Reset
| # | Test | Expected |
|---|------|----------|
| 11.3.1 | Open a closed recurring listing | "Cycle Reset" button visible in Timeline section. |
| 11.3.2 | Open a closed non-recurring listing | "Cycle Reset" button NOT visible. |
| 11.3.3 | Open an open listing | "Cycle Reset" button NOT visible (only shown when closed). |
| 11.3.4 | Click Cycle Reset | Confirm Dialog opens with description of what will happen. |
| 11.3.5 | Confirm Cycle Reset | Form reloads: dates cleared, status=upcoming, isCurated=false, version incremented, lastDeadline preserved. Toast: "Cycle reset." |

### 11.4 Engagement Panel
| # | Test | Expected |
|---|------|----------|
| 11.4.1 | Listing with pending flags | Flags panel shows flag count. Each flag shows issueType + proposedFix. |
| 11.4.2 | Click "Resolve" on a flag | Flag row fades out. Count decrements. |
| 11.4.3 | Click "Dismiss" on a flag | Same as resolve. |
| 11.4.4 | Audit trail shows last 10 entries | Timestamp + actor + action listed. "View full history" link present. |
| 11.4.5 | Click "View full history" | Navigate to /admin/audit?referenceId=[listingId]. |

---

## 12. Admin — Submission Queue [A]

| # | Test | Expected |
|---|------|----------|
| 12.1 | Open /admin/queue with pending submissions | Table populated. Count badge in nav reflects count. |
| 12.2 | Click Approve on a submission | Navigate to /admin/listings/:id pre-filled. Banner: "Review and publish." |
| 12.3 | Fill missing fields and save with status=open | Listing goes live. Removed from queue. |
| 12.4 | Click Reject on a submission | Confirm Dialog with required reason text field. |
| 12.5 | Confirm rejection with reason | Row fades out. Count decrements. Toast: "Submission rejected and archived." Listing retained in DB with status:closed. |
| 12.6 | Reject without entering a reason | Confirm button disabled or reason field shows error. |
| 12.7 | Empty queue | Empty state: "No pending submissions. The queue is clear." |

---

## 13. Admin — Source / Organisation Manager [A]

| # | Test | Expected |
|---|------|----------|
| 13.1 | Open /admin/sources | Table shows all organisations with name, type, level, listing count, isActive toggle. |
| 13.2 | Click Verify → "Mark as Verified" | verificationLevel updates to verified. Badge in row updates. Toast: "[Name] is now verified." |
| 13.3 | Click Verify → "Mark as Official" | Confirm dialog shown. On confirm: level updates to official. |
| 13.4 | Deactivate an active organisation | Confirm Dialog: "Existing listings remain visible. Cannot submit new listings." Confirm → row greys out. Toggle shows off. |
| 13.5 | Verify deactivated org doesn't affect existing listings | Student-facing listings from that org still visible. |
| 13.6 | Reactivate a deactivated organisation | Toggle back to active. Org can submit again. |

---

## 14. Admin — DomainTag Manager [A]

| # | Test | Expected |
|---|------|----------|
| 14.1 | Open /admin/tags | Table shows all tags with slug, displayName, category, counts, isActive toggle. |
| 14.2 | Create a new tag | Inline form: type displayName. Slug auto-generates from displayName. Editable. Submit → row appears in table. Toast: "Tag created." |
| 14.3 | Create tag with duplicate slug | Error: "Slug already exists." |
| 14.4 | Retire a tag with no replacement | Confirm Dialog shows affected listings + user counts. Confirm → tag deactivated. Row greys out. |
| 14.5 | Retire a tag with a replacement slug | Confirm Dialog. On confirm: background migration runs. Toast: "Tag retired and references updated." |
| 14.6 | Verify retired tag no longer shows in student tag picker | Tag absent from /onboarding step 2 and /app/settings interests. |
| 14.7 | Verify orphaned tag slugs silently ignored in feed queries | No error thrown. Feed loads normally for users with retired tags in their interests. |

---

## 15. Admin — Guide Authoring [A]

| # | Test | Expected |
|---|------|----------|
| 15.1 | Open /admin/guides | All guides listed (published + draft). isPublished toggle and linked listing count shown. |
| 15.2 | Create a new guide | Click "New Guide". Title input and split-pane editor render. |
| 15.3 | Type in the editor | Preview panel updates after 200ms debounce. |
| 15.4 | Drag the divider handle | Both panels resize fluidly. |
| 15.5 | Save as draft | Guide saved with isPublished:false. Not visible to students. |
| 15.6 | Publish a guide | Confirm Dialog: "Publish this guide?" On confirm: isPublished:true. Linked listings receive guideId. Toast: "Guide published." |
| 15.7 | Student opens guide URL | Guide content visible. |
| 15.8 | Unpublish a guide | Confirm Dialog. On confirm: isPublished:false. Student can no longer access the URL (404). |
| 15.9 | Link a listing to a guide and publish | That listing's detail page shows the "Prep guide available" banner. |
| 15.10 | Submit with empty title | Title field error. Submission blocked. |
| 15.11 | Toggle isPublished directly from list screen | Same confirm dialog fires. |

---

## 16. Admin — Staleness Queue [A]

| # | Test | Expected |
|---|------|----------|
| 16.1 | Open /admin/stale | All stale listings shown, sorted by oldest lastVerifiedAt first. |
| 16.2 | Click "Re-verify" on a listing | lastVerifiedAt updates to now. isStale clears. Row fades to "clean" state. |
| 16.3 | Click "Open" on a listing | Navigate to /admin/listings/:id (curation panel). |
| 16.4 | All listings re-verified | Empty state: "All listings are up to date." |

---

## 17. Admin — Audit Log Viewer [A]

| # | Test | Expected |
|---|------|----------|
| 17.1 | Open /admin/audit | Recent audit entries shown sorted by timestamp desc. |
| 17.2 | Filter by category: listing | Only listing-category entries shown. |
| 17.3 | Filter by actorType: system | Only cron-generated entries shown. |
| 17.4 | Paste a listingId into referenceId filter | Only entries for that specific listing shown. |
| 17.5 | Filter by date range | Only entries within range shown. |
| 17.6 | Expand diff cell on an edit entry | Inline row expands showing all changed fields (before/after). |
| 17.7 | Collapse diff cell | Row returns to summary. |
| 17.8 | Attempt to edit or delete an audit entry | No edit or delete UI exposed anywhere. Read-only. |

---

## 18. Admin — User Manager [A]

| # | Test | Expected |
|---|------|----------|
| 18.1 | Open /admin/users | Searchable table with all users. |
| 18.2 | Search by name | Table filters in real-time (300ms debounce). |
| 18.3 | Search by email | Same filter behavior. |
| 18.4 | Change a user's role to admin | Confirm Dialog. On confirm: role badge updates. AuditLog entry created. Toast shown. |
| 18.5 | Attempt to change own role | Role control for own row is disabled. Tooltip: "You cannot change your own role." |
| 18.6 | Suspend a student | Confirm Dialog. On confirm: status badge → suspended. |
| 18.7 | Verify suspended student cannot access /app/* | Next request from that student gets 403. Redirected. |
| 18.8 | Unsuspend a student | Toggle back to active. Student can log in and access feed again. |

---

## 19. Organisation Interface [O]

| # | Test | Expected |
|---|------|----------|
| 19.1 | Log in as org user | Redirect to /org/listings. Top nav shows org name + "My Listings" + logout. |
| 19.2 | Access /app/feed as org user | Redirect to /org/listings. |
| 19.3 | Access /admin/listings as org user | Redirect to /org/listings. Toast: "You don't have access." |
| 19.4 | View own submissions table | All previously submitted listings shown with status and review state. |
| 19.5 | Submit a new listing with all fields | POST /org/listings. Redirect to /org/listings. Toast: "Submitted!" Row shows status "Under Review". |
| 19.6 | Submit with title empty | Title field error. Submission blocked. |
| 19.7 | Submit with invalid URL | URL field error. Submission blocked. |
| 19.8 | Edit a listing that is under review | Edit button disabled. Tooltip: "Under admin review. Editing is locked." |
| 19.9 | Admin rejects submission | Org user refreshes /org/listings. Row shows "Rejected" + rejection reason. Edit re-enabled. |
| 19.10 | Org account deactivated mid-session | Next API call returns 403. Toast: "Account inactive. Contact administrator." Forced logout. |

---

## 20. Background Jobs [SYS]

> Trigger these via: (a) manually setting dates in the DB to simulate passage of time, or (b) directly invoking the cron function in a test environment.

| # | Test | Expected |
|---|------|----------|
| 20.1 | Listing with openDate = now, status=upcoming → run status cron | status changes to open. AuditLog entry: "auto_opened". |
| 20.2 | Listing with deadline = now, status=open → run status cron | status changes to closed. deadline copied to lastDeadline (if null). AuditLog: "auto_closed". |
| 20.3 | UserActivity status=saved, listing deadline passed → run cron | UserActivity status = missed. statusUpdatedAt = listing's actual deadline, not cron run time. |
| 20.4 | Listing deadline = today+3, user has saved it, deadlineReminders=true → run notification cron | deadline_3day Notification created. emailSent=true if emailEnabled=true. |
| 20.5 | Run deadline cron twice for same listing+user | Second run does not create a duplicate notification (idempotent). |
| 20.6 | Listing deadline = today+1 → run notification cron | deadline_1day Notification created. In-app only (emailSent=false regardless of prefs). |
| 20.7 | Listing not verified for 270+ days → run staleness cron | isStale set to true. AuditLog: "auto_flagged_stale". |
| 20.8 | Listing lastDeadline > 2 years ago → run staleness cron | isStale set to true. |
| 20.9 | Run staleness cron on already-stale listing | No duplicate AuditLog entry. isStale remains true (idempotent). |
| 20.10 | Listing expectedStart = current month, user interests overlap → run season cron | season_open Notification created. |
| 20.11 | Run season cron twice in same month for same user+listing | Second run skips (already notified this year). |
| 20.12 | Admin sets priority=dont-miss | dont_miss Notifications dispatched immediately (event-driven, not cron). |
| 20.13 | Admin sets priority=dont-miss again within 7 days for same user | User does not receive a second dont_miss notification (frequency cap enforced). |
| 20.14 | Admin sets status=cancelled | cancelled Notifications dispatched immediately to all users with saved/applied activity. |
| 20.15 | Recommendation pre-compute job runs | Redis cache key rec:{userId} populated for all active, onboarded users. Feed loads Recommended from cache (not live DB query). |
| 20.16 | Redis cache miss (key expired or not yet set) | Feed falls back to live computation. Cache populated after response. |

---

## 21. UI Component States

### 21.1 Button
| # | Test | Expected |
|---|------|----------|
| 21.1.1 | Hover a primary button | Background darkens slightly. Cursor: pointer. Transition: 100ms. |
| 21.1.2 | Click a primary button | Scale: 0.97 briefly. Background darkens further. |
| 21.1.3 | Tab to a button | Visible focus ring (2px, offset 2px). |
| 21.1.4 | Disabled button hover | No visual change. Cursor: not-allowed. |
| 21.1.5 | Button in loading state | Spinner replaces label. Width unchanged. Not clickable. |
| 21.1.6 | Double-click a submit button | Only one submission fired. |

### 21.2 Input Fields
| # | Test | Expected |
|---|------|----------|
| 21.2.1 | Click an empty input | Label floats above. Border becomes prominent. |
| 21.2.2 | Blur an email field with invalid format | Border turns red. Error text appears below. |
| 21.2.3 | Password field show/hide toggle | Masking toggles. Icon switches. |
| 21.2.4 | Max-length field: type beyond limit | Character count turns red. No additional input accepted. |
| 21.2.5 | Tab through form fields | Each field receives focus ring in order. |

### 21.3 Modals
| # | Test | Expected |
|---|------|----------|
| 21.3.1 | Open a modal | Backdrop fades in. Panel scales from 0.95 + fades. Focus moves to first interactive element inside. |
| 21.3.2 | Press Escape | Modal closes. Focus returns to trigger element. |
| 21.3.3 | Click backdrop | Modal closes (if form not dirty). |
| 21.3.4 | Click backdrop on dirty modal | Animation halts. "Discard changes?" inline alert appears. |
| 21.3.5 | Tab through modal content | Focus stays inside modal (focus trap). Does not escape to page behind. |

### 21.4 Toasts
| # | Test | Expected |
|---|------|----------|
| 21.4.1 | Success toast appears | Slides in from right. Auto-dismisses after 4s. |
| 21.4.2 | Error toast appears | Stays until manually dismissed (no auto-dismiss). |
| 21.4.3 | Hover a toast | Auto-dismiss pauses. Resumes on mouse leave. |
| 21.4.4 | 4 toasts arrive in quick succession | Oldest toast removed. Max 3 visible at once. |

---

## 22. Responsive / Mobile

| # | Test | Expected |
|---|------|----------|
| 22.1 | Open feed on 375px wide viewport | Single-column card layout. Bottom navigation visible. |
| 22.2 | Open admin on 375px viewport | Sidebar hidden. Hamburger icon visible. Tap hamburger → drawer slides in. |
| 22.3 | Open a modal on 375px viewport | Modal becomes a bottom sheet. Slides up from bottom edge. |
| 22.4 | Open calendar on mobile | Months stack vertically. Normal page scroll. |
| 22.5 | Listing detail action bar on mobile (scroll past) | Action bar sticks to bottom of viewport. |
| 22.6 | Admin table on mobile | Table scrolls horizontally inside container. Left column (title) stays sticky. |
| 22.7 | Split-pane guide editor on mobile | Replaced by "Edit" / "Preview" tab toggle. |

---

## 23. Accessibility

| # | Test | Expected |
|---|------|----------|
| 23.1 | Navigate entire signup form with keyboard only | All fields, buttons, and links reachable and operable. |
| 23.2 | Navigate feed with keyboard | Cards focusable. Save/Ignore buttons separately focusable. Enter navigates to detail. |
| 23.3 | Screen reader announces listing card | aria-label includes: title + org + type + deadline. |
| 23.4 | Screen reader announces toast | Toast region is aria-live. Toasts announced on appear. Error toasts use aria-live="assertive". |
| 23.5 | Screen reader announces tag picker limit | When max reached, "Maximum of 5 reached" announced via aria-live. |
| 23.6 | Focus returns after modal close | Focus returns to the element that opened the modal. |
| 23.7 | prefers-reduced-motion active | Transitions removed. Spinner and shimmer still show. State changes (errors, success) use color/icon/text only. |
| 23.8 | Status badges without color | All badges have aria-label with full text. Not color-only. |

---

## 24. Security

| # | Test | Expected |
|---|------|----------|
| 24.1 | Attempt to mark another user's notification as read (direct API call) | 403 or 404. User isolation enforced server-side. |
| 24.2 | Attempt to access admin API endpoint with student JWT | 403 returned. No data leaked. |
| 24.3 | Attempt to set UserActivity status="missed" via API | 403. System-only field. |
| 24.4 | Submit XSS payload in listing description | Stored as raw text. Rendered via Markdown parser — raw HTML is stripped. Not executed. |
| 24.5 | Submit XSS payload in flag proposedFix field | Stored as text. Rendered as plain text in admin panel. Not executed. |
| 24.6 | Attempt to update another user's profile via API | 403. Endpoint scoped to authenticated userId. |

---

## 25. End-to-End Flows [E2E]

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 25.1 | Full student journey | Register → Verify email → Complete onboarding → Browse feed → Save listing → Mark applied → View on dashboard | All steps complete. State consistent across screens. |
| 25.2 | Full listing lifecycle | Admin creates listing (upcoming) → Cron opens it → Student saves it → Cron closes it → Student sees it as missed on dashboard | Correct status at each stage. |
| 25.3 | Organisation submission → admin approval | Org submits → Admin sees in queue → Admin approves → Listing goes live → Student sees it in feed | Full flow works without errors. |
| 25.4 | Cancellation notification | Admin sets status=cancelled → Students with saved/applied activity receive cancelled notification immediately → Student taps notification → Navigates to listing detail with cancelled banner | Real-time notification dispatch and correct UI state. |
| 25.5 | Cycle reset flow | Admin opens closed recurring listing → Runs cycle reset → Re-enters dates → Publishes → Students see it as upcoming | Listing returns to upcoming state cleanly. |
| 25.6 | Flag and resolve | Student flags a listing with "wrong_deadline" → Admin opens curation panel → Sees flag in engagement panel → Fixes deadline → Resolves flag | Flag disappears from panel after resolution. |
| 25.7 | Tag retirement with replacement | Admin retires "ml" tag with replacement "machine-learning" → All listings and user interests updated → "ml" no longer appears in any picker | Migration runs cleanly. No orphaned refs visible in UI. |

---

*End of COA Test Plan — v1.0*  
*Document ID: COA-TEST-001*
