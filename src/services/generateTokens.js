
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: "1d" }  
  );

  const refreshToken = jwt.sign(
    { userId },
    config.jwtRefreshSecret,
    { expiresIn: "30d" } 
  );

  return { accessToken, refreshToken };
};
