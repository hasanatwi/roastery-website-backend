import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.get("/userProducts", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("product, totalweight, totalprice")
      .eq("email", email);

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    const groupedProducts = {};
    data.forEach((item) => {
      if (!groupedProducts[item.product]) {
        groupedProducts[item.product] = {
          product: item.product,
          totalweight: 0,
          totalprice: 0,
        };
      }
      groupedProducts[item.product].totalweight += parseFloat(item.totalweight);
      groupedProducts[item.product].totalprice += parseFloat(item.totalprice);
    });

    const products = Object.values(groupedProducts).map((p) => ({
      product: p.product,
      totalweight: Number(p.totalweight.toFixed(2)),
      totalprice: Number(p.totalprice.toFixed(2)),
    }));

    console.log("Query result:", products);

    res.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

export default router;
