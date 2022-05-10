## How to run the project
- Create an empty folder on your local machine
- Open CMD in that folder and run: npx create-react-app [app-name] (This will create a react project in that folder (node_modules file...))
- Clone the project from github into that folder
- run: npm install (This will install all required dependencies)
- run: npm start

## Project Structure
The project is divided into several files:
- AddFundsDialog: holds the code for the pop up that is used to add funds to a user
- RequestsDialog: holds the code for the pop up that is used to see the requests of a user
- TradeDialog: holds the code for the pop up that is used to create a new trade request with another user
- UserCredentialsDialog: holds the code for the pop up that is used for registering/loging in
(All the previously mentioned folders have .js files to hold functionalities and .css files to hold styling code)
- App.js: file that holds the main functionalities of the project. Renders the main page, the header, the exchange rate, the grahps...
- App.css: holds the styles of the App.js file