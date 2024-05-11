import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { verifyToken } from "./src/utils/VerifyToken.js";
import initApp from "./src/index.routes.js";
const app = express();
dotenv.config();
// Verify token asynchronously
const decode = verifyToken(
  "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4iLCJuYW1lIjoiSGFzc2FuIiwiaWQiOjUsImVtYWlsIjoiaGFzc2FuMDA3QGdtYWlsLmNvbSIsImV4cCI6MTc0NjkxMTA2NH0.9FPffo-1Y8jf-HMJDissz5p4wgZDUmmJRz3yGcZOUYs"
);
console.log("Decoded Token:", decode.role,decode.id);
initApp(app, express);


//cors
app.use(cors());
// setup port and the baseUrl
// initApp(app, express)

const port = +process.env.PORT;
app.listen(port, () => console.log(`App listening on port:${port}!`));
