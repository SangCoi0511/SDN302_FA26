var http = require("http");
const fs = require('fs');
const { readFile, createFile, appendFile, deleteFile } = require('./file');
const hostname = "localhost";
const port = 3000;
http.createServer(function (request, response) {
    console.log(request.headers);
    const filename = 'index.txt';
    createFile(filename);
    appendFile(filename);
    readFile(filename)
        .then((data) => {
            response.setHeader('Content-Type', 'text/html');
            response.statusCode = 200;
            fs.createReadStream(filename).pipe(response);
        })
        .catch((err) => {
            console.error(`Error reading file:`, err);
            response.statusCode = 500;
            response.end('Internal Server Error');
        });
    deleteFile(filename);
}).listen(port);
console.log(`Server running at http://${hostname}:${port}/`);
