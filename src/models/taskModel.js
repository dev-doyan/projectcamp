
import { PgTable,uuid,text,varchar, pgEnum, pgTable,timestamp } from "drizzle-orm/pg-core";
import { memberTable } from "./memberModel.js";
import { userTable } from "./userModel.js";
import { projectTable } from "./projectModel.js";

export const taskStatus=pgEnum("taskStatus",[
    "todo","in_progress","completed"
]);

export const priority=pgEnum("priority",[
    "low","medium","high"
])

export const taskTable=pgTable("tasks",{
    id:uuid().primaryKey().defaultRandom(),
    title:varchar({length:50}).notNull(),
    description:text(),
    status:taskStatus().default("todo").notNull(),
    priority:priority().default("low").notNull(),
    dueDate:timestamp().notNull(),
    attachmentUrl:text(),
    attachmentPublicId:text(),

    createdBy:uuid().references(()=>userTable.id).notNull(),
    assignedTo:uuid().references(()=>userTable.id).notNull(),
    projectId:uuid().references(()=>projectTable.id).notNull(),

    createdAt:timestamp().defaultNow().notNull(),
     updatedAt:timestamp().defaultNow().notNull(),

})