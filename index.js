import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { verifyToken } from "./src/utils/VerifyToken.js";
import initApp from "./src/index.routes.js";
const app = express();
dotenv.config();
// Verify token asynchronously
const decode = verifyToken(
  "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6NSwiZXhwIjoxNzQ2ODkwODAxfQ.jZhBWLihTUT7PAA7Az1RfaoZe-077x1oF_mdbrCClM0"
);
console.log("Decoded Token:", decode);
initApp(app, express);


//cors
app.use(cors());
// setup port and the baseUrl
// initApp(app, express)

const port = +process.env.PORT;
app.listen(port, () => console.log(`App listening on port:${port}!`));
