// middlewares/authMiddleware.js
import { errorResponse } from '../utils/apiResponse.js';

export const isAuthenticated = (req, res, next) => {
  // Sample logic: Check for a header specifically
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return errorResponse(res, "Unauthorized: No token provided", 401);
  }

  // Verify token logic here...
  // if (valid) next();
  
  console.log("Auth check passed (simulation)");
  next();
};
