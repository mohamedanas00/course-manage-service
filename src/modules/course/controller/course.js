import { asyncHandler } from "../../../utils/errorHandling.js";
import courseModel from "../../../../DB/models/course.model.js";
import { StatusCodes } from "http-status-codes";
import { ApiFeatures } from "../../../utils/apiFeature.js";

export const createCourse = asyncHandler(async (req, res) => {
  const { name, duration, category, capacity } = req.body;
  const instructor = req.user;

  // Check if a course with the same name exists for this instructor
  const existingCourse = await courseModel.findOne({
    name,
    "instructor.id": instructor.id,
  });
  console.log(existingCourse);
  if (existingCourse) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "You already have a course with this name" });
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
  res.status(StatusCodes.CREATED).json({ course });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, duration, category, capacity, isPublished } = req.body;
  const course = await courseModel.findById(id);
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

  res.status(StatusCodes.CREATED).json({ course });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await courseModel.findByIdAndDelete(id);

  if (!course) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: "Course does not exist" });
  }

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
        courseModel.find({ courses }), 
        req.query
    )
        .fields()
        .pagination(courseModel)
        .search()
        .sort()
        .filter();

    let courses = await apiFeatures.mongooseQuery.exec();

    res.status(StatusCodes.OK).json({
        courses,
        totalPages: apiFeatures.totalPages,
        countDocuments: apiFeatures.countDocuments,
        page: apiFeatures.page,
        next: apiFeatures.next,
        previous: apiFeatures.previous
    });
});


export const SearchForInstructor = asyncHandler(async (req, res) => {
    let apiFeatures = new ApiFeatures(
        courseModel.find(), 
        req.query
    )
        .fields()
        .pagination(courseModel)
        .search()
        .sort()
        .filter();

    let courses = await apiFeatures.mongooseQuery.exec();

    res.status(StatusCodes.OK).json({
        courses,
        totalPages: apiFeatures.totalPages,
        countDocuments: apiFeatures.countDocuments,
        page: apiFeatures.page,
        next: apiFeatures.next,
        previous: apiFeatures.previous
    });
});