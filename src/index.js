// import { app } from "./app.js";
// import { connect_DB } from "./database/index.js";

// const PORT = process.env.PORT || 6392
// connect_DB()
// .then((res)=> {
//   app.listen(PORT, ()=> console.log("server is here"))
// } )
// .catch(error => console.log(error))

import { app } from "./app.js";
import { connect_DB } from "./database/index.js";

// Connect to DB when function is initialized
connect_DB()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((error) => console.error("❌ Database connection error:", error));

// Do NOT use app.listen() on Vercel
export default app;

// Optional: Enable local run support
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 6392;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
