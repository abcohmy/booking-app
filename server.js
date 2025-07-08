
const app = require('./app');
const {initializeDb} = require('./db');





const port = process.env.PORT || 5000;


const startServer = async () => {
    await initializeDb();
    app.listen(port, () => {
    console.log (`Express server is listening http://localhost:${port}`);
});
};


startServer();