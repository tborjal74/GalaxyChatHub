import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database/database.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Secret key for JWT (should be in .env, but using a fallback for dev)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      return errorResponse(
        res,
        "Please provide username, email, and password",
        400,
      );
    }

    // ---- PASSWORD VALIDATION ----
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,12}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8–12 characters, contain at least 1 number and 1 special character",
      });
    }
    // -----------------------------

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return errorResponse(
        res,
        "User with this email or username already exists",
        409,
      );
    }

    // Limit check: Don't allow registration if reached 20 users
    const userCount = await prisma.user.count();
    if (userCount >= 20) {
      return errorResponse(
        res,
        "Registration closed: Maximum user limit reached.",
        403,
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        status: "ONLINE", // Default status
      },
    });

    // Create token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Return user info (excluding password) and token
    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(
      res,
      { user: userWithoutPassword, token },
      "User registered successfully",
      201,
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(res, "Registration failed", 500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Please provide email and password", 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Update status to ONLINE
    await prisma.user.update({
      where: { id: user.id },
      data: { status: "ONLINE" },
    });

    // Return user info and token
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      res,
      { user: userWithoutPassword, token },
      "Login successful",
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, "Login failed", 500, error.message);
  }
};
