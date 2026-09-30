import { textureMap, colorMap } from "@/app/constant";

const sizeMap = {
  A: "XS",
  B: "Small",
  C: "Medium",
  D: "Large",
  E: "Extra Large",
  F: "XXL",
  G: "3XL",
};

const gradeMap = {
  "01": "A Grade",
  "02": "B Grade",
};

export const parseMaterialCode = (codeStr) => {
  if (!codeStr || typeof codeStr !== "string") {
    return {
      materialCode: codeStr || "Unknown",
      productType: "Unknown",
      mil: "Unknown Mil",
      size: "Unknown",
      texture: "Unknown",
      color: "Unknown",
      grade: "Unknown",
    };
  }

  const code = codeStr.trim().toUpperCase();
  const len = code.length;

  if (len < 8) {
    return {
      materialCode: code,
      productType: "Unknown",
      mil: "Unknown Mil",
      size: "Unknown",
      texture: "Unknown",
      color: "Unknown",
      grade: "Unknown",
    };
  }

  const gradeKey = code.slice(-2);
  const colorKey = code.slice(-4, -2);
  const textureKey = code.slice(-6, -4);
  const sizeKey = code.slice(-7, -6);
  const milChar = code.slice(-8, -7);
  let rawPrefix = code.slice(0, len - 8);

  let cleanPrefix = rawPrefix.startsWith("R") ? rawPrefix.substring(1) : rawPrefix;
  let productType = "Unknown";
  if (cleanPrefix.includes("NMG")) {
    productType = "NMG Gloves";
  } else if (cleanPrefix.includes("GLOVE")) {
    productType = "Medical Gloves";
  } else if (cleanPrefix) {
    productType = cleanPrefix;
  }

  const mil = /^\d+$/.test(milChar) ? `${milChar} Mil` : "Unknown Mil";
  const size = sizeMap[sizeKey] || "Unknown";
  const texture = textureMap[textureKey] || "Unknown";
  const color = colorMap[colorKey] || "Unknown";
  const grade = gradeMap[gradeKey] || "Unknown";

  return {
    materialCode: codeStr,
    productType,
    mil,
    size,
    texture,
    color,
    grade,
  };
};
