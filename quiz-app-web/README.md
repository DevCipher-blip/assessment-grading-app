# Quiz-App-Web
### Setup
- The web frontend is built using React
- Make sure you have Node 16+ installed on your system
- Clone the repo on your local
- Install NVM on your system
- Installed Node 16 using NVM:
```
nvm install 16
```
- Use Node 16 using NVM:
```
nvm use 16
```
- Navigate to the directory containing packages.json
- Install npm packages using:
```
npm install
```
- Create a `.env` file in root (same directory as packages.json) and place the env variables there
- Replace the url of the API which needs to be connected to the frontend by replacing the value of the following env variable in the `.env` file. Sample value for the env variable is provided for ease:
```
REACT_APP_API_BASEURL=http://localhost:8000/
```
- Run the server using:
```
npm start
```
- The server is up now on http://127.0.0.1:3000
