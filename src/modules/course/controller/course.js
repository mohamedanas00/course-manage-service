import { asyncHandler } from "../../../utils/errorHandling.js";
import courseModel from "../../../../DB/models/course.model.js";
import { StatusCodes } from "http-status-codes";
import { ApiFeatures } from "../../../utils/apiFeature.js";
import logsModel from "../../../../DB/models/logs.model.js";
import { deleteEnrollmentWithCircuitBreaker } from "../../../utils/deleteEnrolmentAPI.js";
import { UpdateEnrolledCourseCircuitBreaker } from "../../../utils/updateCourseEnrolledAPI.js";
import { ErrorClass } from "../../../utils/errorClass.js";

export const createCourse = asyncHandler(async (req, res, next) => {
  const { name, duration, category, capacity } = req.body;
  const instructor = req.user;

  // Check if a course with the same name exists for this instructor
  const existingCourse = await courseModel.findOne({
    name,
    "instructor.id": instructor.id,
  });
  if (existingCourse) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You already have a course with this name" });
  }
  const course = await courseModel.create({
    name,
    duration,
    category,
    capacity,
    instructor: {
      id: instructor.id,
      name: instructor.name,
      email: instructor.email,
    },
  });
  await logsModel.create({
    userId: instructor.id,
    email: instructor.email,
    role: instructor.role,
    action: `Create course successfully with id ${course._id}`,
  });
  res.status(StatusCodes.CREATED).json({ course });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  const { name, duration, category, capacity, isPublished } = req.body;
  const { id } = req.params;
  const course = await courseModel.findById(id);
  if (!course) {
    return next(new ErrorClass("course is Not Exist!", StatusCodes.NOT_FOUND));
  }
  if (name) {
    course.name = name.toLowerCase();
    const checking = await UpdateEnrolledCourseCircuitBreaker(id, name);
    console.log(checking);
    if (checking.status !== 200) {
      return res.status(checking.status).json({ message: checking.message });
    }
  }
  if (duration) {
    course.duration = duration;
  }
  if (category) {
    course.category = category;
  }
  if (capacity) {
    course.capacity = capacity;
  }
  if (isPublished) {
    course.isPublished = isPublished;
  }
  if (name || duration || category || capacity || isPublished) {
    await course.save();
  } else {
    return next(new ErrorClass("Nothing To Update!", StatusCodes.BAD_REQUEST));
  }

  res.status(StatusCodes.OK).json({ course });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await courseModel.findById(id);
  if (!course) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Course does not exist" });
  }
  const checking = await deleteEnrollmentWithCircuitBreaker(id);
  console.log(checking);
  if (checking.status !== 200) {
    return res.status(checking.status).json({ message: checking.message });
  }
  await courseModel.deleteOne({ _id: id });

  res.status(StatusCodes.OK).json({ message: "Course deleted successfully" });
});

export const getAllCourseForAdminAndInstructor = asyncHandler(
  async (req, res) => {
    const courses = await courseModel.find();
    res.status(StatusCodes.OK).json({ courses });
  }
);

export const getAllCourseForStudent = asyncHandler(async (req, res, next) => {
  const courses = await courseModel.find({ isPublished: true });
  res.status(StatusCodes.OK).json({ courses });
});

export const SearchForStudent = asyncHandler(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(
    courseModel.find({ isPublished: true }),
    req.query
  )
    .fields()
    .pagination(courseModel.find({ isPublished: true }))
    .search()
    .sort()
    .filter();

  let courses = await apiFeatures.mongooseQuery.exec();

  res.status(StatusCodes.OK).json({
    courses,
    countDocuments: apiFeatures.countDocuments,
  });
});

export const SearchForInstructor = asyncHandler(async (req, res, next) => {
  let apiFeatures = new ApiFeatures(courseModel.find(), req.query)
    .fields()
    .pagination(courseModel)
    .search()
    .sort()
    .filter();

  let courses = await apiFeatures.mongooseQuery.exec();

  res.status(StatusCodes.OK).json({
    courses,
    countDocuments: apiFeatures.countDocuments,
  });
});

export const getMyCourseForInstructor = asyncHandler(async (req, res, next) => {
  const courses = await courseModel.find({
    "instructor.id": req.user.id,
  });
  res.status(StatusCodes.OK).json({ courses });
});
//?using in another microservice
export const CheckCategoryAndUpdateEnrollmentStudents = asyncHandler(
  async (req, res) => {
    const { courseId } = req.params;
    const course = await courseModel.findById(courseId);
    console.log(course);
    if (!course) {
      console.log("sssss");
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Course not found" });
    }
    if (course.capacity <= course.enrolledStudents) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Course is full" });
    }
    course.enrolledStudents = course.enrolledStudents + 1;
    await course.save();
    res.status(StatusCodes.OK).json({ message: "Done" });
  }
);
//?using in another microservice
export const DeleteInstructorCourses = asyncHandler(async (req, res, next) => {
  const { instructorId } = req.params;
  const courses = await courseModel.deleteMany({
    "instructor.id": instructorId,
  });
  res.status(StatusCodes.OK).json({ courses });
});
