import { StatusCodes } from "http-status-codes";
import reviewModel from "../../../../DB/models/review.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


//*ToDO
export const createReview = asyncHandler(async (req, res) => {
  const { comment, rating } = req.body;
  const { id } = req.params;
  const student = req.user;
  const isExistCourse = await courseModel.findById(id);

  if (!isExistCourse) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Course Not Found" });
  }
  const existingReview = await reviewModel.findOne({
    courseId: id,
    "student.id": student.id,
  });

  if (existingReview) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You have already reviewed this course." });
  }
  const review = await reviewModel.create({
    comment,
    rating,
    courseId: id,
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
  });

  const totalRatings = isExistCourse.rating * isExistCourse.enrolledStudents;
  const newEnrolledStudents = isExistCourse.enrolledStudents + 1;
  const newTotalRatings = totalRatings + rating;
  const newRating = newTotalRatings / newEnrolledStudents;

  isExistCourse.rating=newRating

  res.status(StatusCodes.CREATED).json({ review });
});
