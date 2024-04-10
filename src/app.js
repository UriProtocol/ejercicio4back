const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");

//rutas
const routes = require("./routes/app.routes");

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", routes);

module.exports = app;
