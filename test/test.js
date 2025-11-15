import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://brjmjmslzhwdtxplsqkb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyam1qbXNsendoZHR4cGxzcWtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2Njg5NywiZXhwIjoyMDc4NDQyODk3fQ.sCkWHiv3wsg0gSqyNRuKd11sbw0SPkvAfSLx7WKXK6c"
);

const test = await supabase.from("usuarios").select("id").limit(1);
console.log(test);
