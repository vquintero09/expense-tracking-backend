import express from "express";
import cors from "cors";
import { env } from "./config.ts";
import { ExpenseRouter } from "./routes/expenseRouter.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/expenses", ExpenseRouter);

app.listen(env.PORT, () => {
  console.log(`http://localhost:${env.PORT}`);
});
