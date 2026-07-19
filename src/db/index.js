import {drizzle} from "drizzle-orm/node-postgres"
import dotenv from "dotenv"
dotenv.config()

const db=drizle(process.env.DATABASE_URL);
export default db;