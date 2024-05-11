import {Router} from 'express'
import * as courseController from "./controller/course.js";
import auth, { userAuth } from '../../middleware/auth.js';



const courseRoute = Router();

courseRoute.post('/AddCourse',auth(userAuth.instructor),courseController.createCourse)
courseRoute.delete('/DeleteCourse/:id',auth(userAuth.admin),courseController.deleteCourse)
courseRoute.put('/UpdateCourse/:id',auth(userAuth.admin),courseController.updateCourse)


export default courseRoute