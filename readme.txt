Api only?  Yes 
Auth? jwt
Backend? SQL 

Notes: Verify arguments

Task will consist of
Title
Description
Creation timestamp
Completed
owner


User will consist of
name
password
email

Routes:
CRUD User(REST)
CRUD Task(GraphQL)

Route names:
POST: /users 
GET: /users/self
PATCH: /users/self
DELETE: /users/self

GraphQL Route Name: /users/self/tasks

Deleting a Task deletes it from user thing too
Deleting a user deletes a user's tasks too

Move from the ground up
make models(Task and User)
make the logic, the controllers
test them until you know they're perf
THEN make the express routes and GraphQL routes
Then test them out too!
every single one of them!




