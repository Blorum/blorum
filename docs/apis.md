# Documents - APIs
Those APIs are meant to be designed in RESTful.

### /user/login
##### POST
_Take params_
- username - String
- password - String
_Return_
header:
Set-Cookie: "xxx...(same as token)"
body:
{
	"token": "xxx....",
	"expire_after": "[UTC Timestamp]"
}

### /user/logout
##### POST
_Take params_
- token - String
_Return_
If success: 200
If error happened: 500
### /user/update

### /user/suicide