import { PgTable,uuid,text,varchar, pgTable ,pgEnum,timestamp} from "drizzle-orm/pg-core";
import { projectTable } from "./projectModel.js";
import { userTable } from "./userModel.js";

export const member_roleEnum=pgEnum("member_role",[
    "owner","member","admin","viewer"
])

export const memberTable=pgTable("members",{
id:uuid().primaryKey().defaultRandom(),
projectId:uuid().references(()=>projectTable.id).notNull(),
userId: uuid().references(() => userTable.id).notNull(),

role: member_roleEnum().default("member").notNull(),

joinedAt: timestamp().defaultNow().notNull()
    

})