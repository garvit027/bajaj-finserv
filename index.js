import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const OFFICIAL_EMAIL = "garvit0419.be23@chitkara.edu.in";

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ is_success: false });
    }

    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci": {
        const n = Number(body[key]);
        if (!Number.isInteger(n) || n < 0) {
          return res.status(400).json({ is_success: false });
        }
        data = fibonacci(n);
        break;
      }

      case "prime": {
        if (!Array.isArray(body[key])) {
          return res.status(400).json({ is_success: false });
        }
        const arr = body[key].map(Number);
        data = arr.filter(isPrime);
        break;
      }

      case "lcm": {
        if (!Array.isArray(body[key]) || body[key].length === 0) {
          return res.status(400).json({ is_success: false });
        }
        const arr = body[key].map(Number);
        data = arr.reduce(lcm);
        break;
      }

      case "hcf": {
        if (!Array.isArray(body[key]) || body[key].length === 0) {
          return res.status(400).json({ is_success: false });
        }
        const arr = body[key].map(Number);
        data = arr.reduce(hcf);
        break;
      }

      case "AI": {
        const question = body[key];
        if (typeof question !== "string" || question.trim().length === 0) {
          return res.status(400).json({ is_success: false });
        }
        data = await askAI(question);
        break;
      }

      default:
        return res.status(400).json({ is_success: false });
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });
  } catch (err) {
    return res.status(500).json({ is_success: false });
  }
});

function fibonacci(n) {
  if (n === 0) return [];
  if (n === 1) return [0];

  const res = [0, 1];
  for (let i = 2; i < n; i++) {
    res.push(res[i - 1] + res[i - 2]);
  }
  return res;
}

function isPrime(num) {
  if (!Number.isInteger(num) || num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function hcf(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function lcm(a, b) {
  return Math.abs(a * b) / hcf(a, b);
}

async function askAI(question) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Answer the following question in ONE WORD only.\nQuestion: ${question}`
                }
              ]
            }
          ]
        })
      }
    );

    const result = await response.json();

    let answer =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";

    answer = answer.replace(/[^a-zA-Z]/g, "").trim();

    return answer.length > 0 ? answer : "Unknown";
  } catch {
    return "Unknown";
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
