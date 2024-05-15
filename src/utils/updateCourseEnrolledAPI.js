
import CircuitBreaker from "opossum";
import axios from "axios";

async function UpdateEnrolledCourse(courseId, courseName) {
    try {
      console.log("checkEnrollment", courseId, courseName);
      // Pass userId in the request body
      const response = await axios.patch(
        `http://localhost:${process.env.ENROLLMENT_PORT}/enrollment/UpdateEnrolledCourse/${courseId}`,
        { name: courseName }
      );
      // Assuming the response contains a status indicating enrollment status
      return response.data.isEnrolled;
    } catch (error) {
      if (error.response) {
        return error.response.data.message;
      }
      throw error;
    }
}
  

const options = {
  timeout: 3000, //*If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 100, //*This doesn't affect the fixed number of failed requests
  resetTimeout: 10000, //*After 10 seconds, try again.
};

const failedRequestsThreshold = 3; //*FIXED NUMBER OF FAILED REQUESTS

const breaker = new CircuitBreaker(UpdateEnrolledCourse, options);

let failedRequestsCount = 0; //*Counter to track the number of failed requests

// Exporting breaker.fire
export async function UpdateEnrolledCourseCircuitBreaker(courseId, courseName) {
  try {
    //*Call checkEnrollment function via CircuitBreaker
    const result = await breaker.fire(courseId, courseName);
    //*If request succeeded, reset failed requests count
    failedRequestsCount = 0;
    return result;
  } catch (error) {
    //*Increment failed requests count
    failedRequestsCount++;
    //!If the number of failed requests exceeds the threshold, trigger the circuit
    if (failedRequestsCount >= failedRequestsThreshold) {
      breaker.open();
    }
    return error.message;
  }
}
