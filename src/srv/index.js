const express = require('express');

const app = express();

app.use(express.static("src/web"));

app.listen("7999", () => {
    console.log("Server is running on http://localhost:7999");
})