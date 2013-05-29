taskserver
==========

My personal management software.


It's written in javascript and provides multiple todo lists and quickactions to the user.  It is a single user system
at the momement.  Many of the administrative action are currently done directly inside the url bar.  The a paramater takes
a function name, that function then handles extra paramaters.  p is for profile and t is for task.

actions:

add, add a new profile (todo list), requires p.
addto, adds a task to a profile, requires p and t.
removefrom, removes a task from a profile, requires p and t.

quickactions:

These are custom made by the developer.  They perform actions without paramaters.
They are also automatically clickable on the front page.
