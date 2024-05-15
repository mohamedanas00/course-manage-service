import CircuitBreaker from "opossum";
import axios from "axios";

async function deleteEnrollment(courseId) {
  try {
    console.log("checkEnrollment", courseId);
    await axios.delete(
      `http://localhost:${process.env.ENROLLMENT_PORT}/enrollment/DeleteEnroll/${courseId}`
    );
    return true;
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

const breaker = new CircuitBreaker(deleteEnrollment, options);

let failedRequestsCount = 0; //*Counter to track the number of failed requests

// Exporting breaker.fire
export async function deleteEnrollmentWithCircuitBreaker(courseId) {
  try {
    //*Call checkEnrollment function via CircuitBreaker
    const result = await breaker.fire(courseId);
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
    // Handle error
    if (error.response) {
      // The request was made and the server responded with a status code
      console.log(error.response.status); // Status code
      console.log(error.response.data); // Response data
      return "error.response";

    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
      return "Disconnected";
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
      return "error.message";
    }
    return error.message;
  }
}
