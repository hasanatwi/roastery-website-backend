import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getTableName(title) {
  if (title.startsWith("Roasted")) return "roasted_nuts";
  if (title.startsWith("Raw")) return "raw_nuts";
  if (title.startsWith("Dates")) return "dates";
  if (title.startsWith("Dried")) return "driedfruits";
  if (title.startsWith("Candies")) return "candiesandjellies";
  if (title.startsWith("Chocolate")) return "chocolate_gifts";
  if (title.startsWith("Chinese")) return "chinese";
  if (title.startsWith("Seeds")) return "seeds";
  if (title.startsWith("Coffee")) return "coffee";
  return null;
}

router.get("/products/:title", async (req, res) => {
  const { title } = req.params;
  const tableName = getTableName(title);

  if (!tableName) {
    return res.status(400).json({
      success: false,
      message: "Invalid category",
    });
  }

  try {
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      console.error(`Supabase error for ${tableName}:`, error);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: error.message,
      });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;

