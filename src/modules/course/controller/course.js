import { asyncHandler } from "../../../utils/errorHandling.js";
import courseModel from "../../../../DB/models/course.model.js";
import { StatusCodes } from "http-status-codes";
import { ApiFeatures } from "../../../utils/apiFeature.js";
import logsModel from "../../../../DB/models/logs.model.js";
import { deleteEnrollmentWithCircuitBreaker } from "../../../utils/deleteEnrolmentAPI.js";

export const createCourse = asyncHandler(async (req, res) => {
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

export const updateCourse = asyncHandler(async (req, res) => {
  const { name, duration, category, capacity, isPublished } = req.body;
  if (!course) {
    return next(new ErrorClass("Comment is Not Exist!", StatusCodes.NOT_FOUND));
  }
  if (name) {
    course.name = name.toLowerCase();
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

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await courseModel.findById(id);
  if (!course) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Course does not exist" });
  }
  const checking = await deleteEnrollmentWithCircuitBreaker(id);
  console.log(checking);
  if (checking !== true) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: checking });
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

export const getAllCourseForStudent = asyncHandler(async (req, res) => {
  const courses = await courseModel.find({ isPublished: false });
  res.status(StatusCodes.OK).json({ courses });
});

export const SearchForStudent = asyncHandler(async (req, res) => {
  let apiFeatures = new ApiFeatures(
    courseModel.find({ isPublished: false }),
    req.query
  )
    .fields()
    .pagination(courseModel.find({ isPublished: false }))
    .search()
    .sort()
    .filter();

  let courses = await apiFeatures.mongooseQuery.exec();

  res.status(StatusCodes.OK).json({
    courses,
    countDocuments: apiFeatures.countDocuments,
  });
});

export const SearchForInstructor = asyncHandler(async (req, res) => {
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

export const getMyCourseForInstructor = asyncHandler(async (req, res) => {
  const courses = await courseModel.find({
    "instructor.id": req.user.id,
  });
  res.status(StatusCodes.OK).json({ courses });
});

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
