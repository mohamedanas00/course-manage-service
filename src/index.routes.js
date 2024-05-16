import connectDB from "../DB/connection.js";
import courseRoute from "./modules/course/course.routes.js";
import logsRoute from "./modules/logs/logs.routes.js";
import reviewRoute from "./modules/review/review.routes.js";
import { globalErrorHandling } from "./utils/errorHandling.js";

const initApp = (app, express) => {
  app.use(express.json());

  app.use('/course',courseRoute)
  app.use('/review',reviewRoute)
  app.use("/logs",logsRoute)
  app.use(globalErrorHandling);

  app.use("/*", (req, res, next) => {
    return res.status(404).json({ message: "In_valid Routing🚫" });
  });
  connectDB();
};

export default initApp;
