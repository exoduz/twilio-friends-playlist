const express = require('express');
const path = require('path');
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

// Livereload.
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

const app = express();
const port = 3002;

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.use(connectLivereload());

// var hikes = {
// 	url: "https://api.com/hikes",
// 	headers: {
// 		'Identifier': identifier
// 	}
// };

// var availability = {
// 	url: "https://api.com/hikes",
// 	headers: {
// 		'Identifier': identifier
// 	}
// };

app.get('/', (req, res) => {


	res.send('Hello World!g');
})

app.listen(port, () => {
	console.log('Running');
});
