# To-do list Web App

This is a web app created using Node.js and related packages (mongoose, express, body-parser, lodash, EJS).

## Functionality

* Loads a default list titled "Today"
* Add and delete items
* Create custom lists using a URL (Add "/your-new-list-name" to the URL of web App)
* Add and delete items from custom lists
* Data persisted in a mongoDB database, thus available after refresh.


## Run on your system

### Requirements
- [Node.js](https://nodejs.org/en/)
- [Nodemon](https://www.npmjs.com/package/nodemon) (for running the server)
- [MongoDB](https://docs.mongodb.com/manual/installation/)

### Steps to Run
1. Clone/download this repositiory: `git clone https://github.com/pmessan/todolist.git`
2. Install packages dependencies `cd todolist && npm i`
3. Start the web server with nodemon `nodemon app.js`
4. Go to [localhost:3000]() on your web browser
5. Voilà! Your Todolist is live!

Hosted live using Heroku and MongoDB Atlas at [Link to be posted]()
