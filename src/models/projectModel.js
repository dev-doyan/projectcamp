
import {uuid,text,varchar,pgTable, pgEnum,timestamp,index } from "drizzle-orm/pg-core"
import { userTable } from "./userModel.js"
export const statusEnum=pgEnum('status',["active","in_progress","completed"])
export const projectTable=pgTable("projects",{
    id:uuid().primaryKey().defaultRandom(),
    name:varchar({length:50}).notNull(),
    description:text(),
    status:statusEnum().notNull().default("active"),
    createdAt:timestamp().defaultNow(),
    updatedAt:timestamp().defaultNow(),
    ownerId:uuid().references(()=>userTable.id).notNull()

},(table)=>({
    namein:index("namein").on(table.name)
}))
