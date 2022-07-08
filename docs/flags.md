# Document - Flags

Flags are the atom controller of Blorum's permissions.

They are just the prerequisite for a user to perform certain actions, specific 

contents could set different policies, allowing a user to act without those 

flags, or disable them with corresponding flags.

## True / False Flags

### bypass_all_rate_limits

## Categorical Flags

articles, posts, notes, comments:

- 0: Unallowed.
- 1: Allowed to perform action to themselves' contents.(For notes, it is public visibility.)
- 2: Allowed to perform action to themselves' contents, even if it is "protected".
- 3: Allowed to perform action to everyones' contents, except those with an author that has the role of admin or moderator, and articles/posts with "protected".
- 4: Allowed to perform action to everyones' contents, except those with an author that has the role of admin or moderator.
- 5: Allowed to perform action to everyones' contents.

#### articles.create

#### articles.anonymous

#### articles.edit

#### articles.remove

#### articles.pin

#### articles.protect

#### articles.react

#### articles.react.remove

#### articles.pin

#### posts.create

#### posts.edit

#### posts.remove

#### posts.pin.forum

#### posts.pin.global

#### articles.react

#### articles.react.remove

#### notes.create

#### notes.anonymous

#### notes.edit

#### notes.remove

#### notes.report

#### comments.anonymous

#### comments.create

#### comments.edit

#### comments.remove

#### comments.vote.up

#### comments.vote.down

#### comments.report

#### user.create

#### user.modify

#### user.modify.sensitive

#### user.report

#### user.ban.posts

#### user.ban.articles

#### user.ban.reacts

#### user.ban.notes

#### user.remove

#### user.statistics.regular_read

#### user.statistics.sensitive_read


### Varible Flags

Varible Flags are often used to set rate limits.