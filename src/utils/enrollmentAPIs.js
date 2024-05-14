import axios from "axios";

export async function checkEnrollment (courseId, userId) {
  try {
    console.log("checkEnrollment", courseId, userId);
    // Make a GET request to the checkIsEnrolled endpoint
    const response = await axios.get(`http://localhost:${process.env.ENROLLMENT_PORT}/enrollment/CheckIsEnrolled/${courseId}?userId=${userId}`)
    if (response.status === 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Error checking enrollment:', error);
  }
}


