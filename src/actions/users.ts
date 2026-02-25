"use server";

import supabaseConfig from "@/app/config/supabse-config";
import { IUser } from "./../app/interfaces/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";




export const registerUser = async (payload: Partial<IUser>) => {
  try {
    const email = payload.email?.trim().toLowerCase();

    if (!email) {
      throw new Error("Email is required");
    }

    const { data: existingUser, error: existingUserError } = await supabaseConfig
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUserError) {
      throw new Error(existingUserError.message);
    }

    if (existingUser) {
      throw new Error("User email already exists please choose another email");
    }

    // hash the password before storing it in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password || "", salt);

    const { data, error } = await supabaseConfig
      .from("user_profiles")
      .insert({
        name: payload.name,
        email,
        password: hashedPassword,
        role: payload.role || "customer",
        status: payload.status || "active",
      })
      .select("*");
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          throw new Error("User email already exists");
        }
        throw new Error(error.message);
      }
    return {
      success: true,
      message: "User registered successfully",
      user: data ? data[0] : null,
    };

  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred during registration",
    };
  }
};

type LoginPayload = Pick<IUser, "email" | "password" | "role">;

export const loginUser = async (payload: LoginPayload) => {
  try {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password || "";
    const role = payload.role;

    if (!email || !password || !role) {
      throw new Error("Email, password, and role are required");
    }

    const { data: user, error } = await supabaseConfig
      .from("user_profiles")
      .select("id, email, password, role, status")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.role !== role) {
      throw new Error("Selected role does not match this account");
    }

    if (user.status && user.status !== "active") {
      throw new Error("Your account is not active");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password || "");

    if (!isPasswordMatched) {
      throw new Error("Invalid credentials");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT secret is not configured");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "An error occurred during login",
    };
  }
};

type TokenPayload = {
  id: number;
  email: string;
};

export const getLoggedInUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new Error("Unauthorized: token not found");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT secret is not configured");
    }

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

    if (!decoded?.id || !decoded?.email) {
      throw new Error("Invalid token payload");
    }

    const { data: user, error } = await supabaseConfig
      .from("user_profiles")
      .select("id, created_at, name, email, role, status")
      .eq("id", decoded.id)
      .eq("email", decoded.email)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      message: "User fetched successfully",
      user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch logged in user",
      user: null,
    };
  }
};

