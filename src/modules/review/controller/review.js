import { StatusCodes } from "http-status-codes";
import reviewModel from "../../../../DB/models/review.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { checkEnrollmentWithCircuitBreaker } from "../../../utils/checkEnrollmentAPIs.js";
import courseModel from "../../../../DB/models/course.model.js";
import logsModel from "../../../../DB/models/logs.model.js";

//*Calling microservice to check if the user is enrolled in the course
export const createReview = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const student = req.user;
  const userId = student.id;
  const isReview = await reviewModel.findOne({
    courseId,
    "student.id": userId,
  });
  if (isReview)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You have already reviewed this course!" });

  const checking = await checkEnrollmentWithCircuitBreaker(courseId, userId);
  console.log(checking);
  if (checking.status !== 200) {
    return res.status(checking.status).json({ message: checking.message });
  }

  const review = await reviewModel.create({
    comment: req.body.comment,
    rating: req.body.rating,
    courseId,
    student: {
      id: userId,
      name: student.name,
      email: student.email,
    },
  });
  const course = await courseModel.findById(courseId);
  let oldRating = course.rating;
  let newRating =
    (oldRating * course.enrolledStudents + review.rating) /
    course.enrolledStudents;
  if (newRating > 5) {
    newRating = 5;
  }
  course.rating = newRating;

  await course.save();

  await logsModel.create({
    userId: student.id,
    email: student.email,
    role: student.role,
    action: `Create review successfully with id ${review._id}`,
  });
  await review.save();
  res.status(StatusCodes.CREATED).json({ review });
});

 