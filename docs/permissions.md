# Design document - Permissions

Blorum has some built-in roles of permissions, for atomized control, Flags needed to be manipulated.

User roles does not actually grant user permissions, when an user were granted with certain roles, they will in the meanwhile be granted with flags defined in modules/permission.mjs. Allowed atomized permission control. *Except for Omni*

### Omni

Only the owner of the server should be, and by default, will be granted with this permission.

This permission allowed its user to bypass all verfications.

Extensions developers should also implement so.

### Admin

### Moderator

