import {Router} from 'express'
import * as reviewController from "./controller/review.js";
import auth, { userAuth } from '../../middleware/auth.js';
const reviewRoute = Router();


reviewRoute.post('/CreateReview/:courseId',auth(userAuth.student),reviewController.createReview)

export default reviewRoute