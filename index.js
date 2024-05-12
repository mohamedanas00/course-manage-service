import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { verifyToken } from "./src/utils/VerifyToken.js";
import initApp from "./src/index.routes.js";
const app = express();
dotenv.config();

app.use(cors());
// setup port and the baseUrl
// initApp(app, express)

const port = +process.env.PORT;
app.listen(port, () => console.log(`App listening on port:${port}!`));
