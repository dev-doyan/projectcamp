
import dotenv from "dotenv";
dotenv.config();
import {defineConfig} from "drizzle-kit"

const config=defineConfig({
    out:"./drizzle",
    schema:"./src/models/index.js",
dbCredentials:{
    url:process.env.DATABASE_URL
},
dialect:"postgresql"
})
export default config;