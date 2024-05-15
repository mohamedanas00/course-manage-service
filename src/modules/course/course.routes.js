import {Router} from 'express'
import * as courseController from "./controller/course.js";
import auth, { userAuth } from '../../middleware/auth.js';



const courseRoute = Router();
courseRoute.post('/AddCourse',auth(userAuth.instructor),courseController.createCourse)
courseRoute.delete('/DeleteCourse/:id',auth(userAuth.admin),courseController.deleteCourse)
courseRoute.put('/UpdateCourse/:id',auth(userAuth.admin),courseController.updateCourse)
courseRoute.get('/GetCoursesSuperAdmin',auth(userAuth.superAdmin),courseController.getAllCourseForAdminAndInstructor)
courseRoute.get('/GetCoursesStudent',auth(userAuth.student),courseController.getAllCourseForStudent)
courseRoute.get('/SearchCoursesStudent',auth(userAuth.student),courseController.SearchForStudent)
courseRoute.get('/SearchCoursesInstructor',auth(userAuth.instructor),courseController.SearchForInstructor)
courseRoute.get('/InstructorCourses',auth(userAuth.instructor),courseController.getMyCourseForInstructor)
courseRoute.patch('/UpdateEnrollCourse/:courseId',courseController.CheckCategoryAndUpdateEnrollmentStudents)

export default courseRoute