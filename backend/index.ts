import app from "./src/app";
import { connectDB } from "./src/config/database";

const port = process.env.PORT || 3000;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`The server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Failed to start server", error);
    process.exit(1);
  });
