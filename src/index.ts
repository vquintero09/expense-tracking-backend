import express from "express";
import cors from "cors";
import { env } from "./config.ts";
import { MovementRouter } from "./routes/MovementRouter.ts";
import { categoryRouter } from "./routes/categoryRouter.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/movements", MovementRouter);
app.use("/categories", categoryRouter);

app.listen(env.PORT, () => {
  console.log(`http://localhost:${env.PORT}`);
});
