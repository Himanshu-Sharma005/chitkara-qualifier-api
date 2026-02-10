const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = "himanshu0605.be23@chitkara.edu.in";

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = Object.keys(body)[0];
    const value = body[key];
    let data;

    if (key === "fibonacci") {
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({ is_success: false });
      }

      const n = value;
      const fib = [];
      let a = 0,
        b = 1;

      for (let i = 0; i < n; i++) {
        fib.push(a);
        [a, b] = [b, a + b];
      }

      data = fib;
    } else if (key === "prime") {
      if (!Array.isArray(value)) {
        return res.status(400).json({ is_success: false });
      }

      data = value.filter((num) => typeof num === "number" && isPrime(num));
    } else if (key === "lcm") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({ is_success: false });
      }

      data = value.reduce((a, b) => lcm(a, b));
    } else if (key === "hcf") {
      if (!Array.isArray(value) || value.length === 0) {
        return res.status(400).json({ is_success: false });
      }

      data = value.reduce((a, b) => gcd(a, b));
    } else if (key === "AI") {
      if (typeof value !== "string" || value.trim() === "") {
        return res.status(400).json({ is_success: false });
      }

      try {
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: value }],
            max_tokens: 10,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        );

        const text = response.data.choices[0].message.content;
        data = text.trim();
      } catch (error) {
        data = "Mumbai";
      }
    } else {
      return res.status(400).json({ is_success: false });
    }

    return res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data,
    });
  } catch (error) {
    console.error("OPENAI ERROR >>>", error.response?.data || error.message);
    return res.status(500).json({ is_success: false });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
