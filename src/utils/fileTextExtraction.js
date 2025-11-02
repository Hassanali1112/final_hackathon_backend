import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import fs from "fs";
import Tesseract from "tesseract.js";

export const extractText = async (filePath, mimeType) => {
  console.log("text file");
  try {
    if (mimeType.includes("pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      console.log("check text pdf");
      const data = await pdf(dataBuffer);
      console.log("text", data.text);
      return data.text;
    } else if (mimeType.includes("image")) {
      const result = await Tesseract.recognize(filePath, "eng");
      console.log("check text image", result.data.text);

      return result.data.text;
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    return "";
  } finally {
    // fs.unlinkSync(filePath); // delete temp file
  }
};
