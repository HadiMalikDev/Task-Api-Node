# Task API

## Features:
  A Task API created using NodeJS.
  It showcases knowledge about:
  - Express
  - GraphQL
  - Jest
  - JWT
  - Knex
  - MySQL(100 Tests, more than 1k lines of test code)
  
  Users can perform CRUD operations on their accounts using REST Api. They can then perform CRUD operations on tasks using GraphQL. 
  Read, Updation and Deletion routes of REST Api are protected via token authentication.
  All CRUD operations related to tasks are protected via token authentication.
  This ensures that users cannot mess with other user's accounts, or their tasks.
  
  A Query Builder(knex) was used instead of a full fledged ORM since knex is close enough to the DB layer to ensure that proper understanding of SQL syntax is necessary to construct queries.
  
  The Jest tests over testing of the models and controllers for the REST API routes.
