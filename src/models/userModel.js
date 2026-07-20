
import {uuid,integer,pgTable,varchar,text,pgEnum,boolean,timestamp,index} from "drizzle-orm/pg-core";

export const roleEnum=pgEnum("role",[
    "admin","projectadmin","member"
])


export const userTable=pgTable("users",{
    id:uuid().primaryKey().defaultRandom(),
    name:text().notNull(),
    email:text().notNull().unique(),
    avatar:text(),
    avatar_localpath:text(),
    username:varchar({length:30}).notNull().unique(),
    password:text().notNull(),
    role:roleEnum().notNull().default("member"),
    isEmailVerified:boolean().default(false).notNull(),
    refreshToken: text(),
    forgotPasswordToken: text(),
    forgotPasswordExpiry: timestamp(),

    emailVerificationToken: text(),

    emailVerificationExpiry: timestamp(),

    createdAt: timestamp()
        .defaultNow()
        .notNull(),

    updatedAt: timestamp()
        .defaultNow()
        .notNull(),


 },(table)=>({
    // emailin:index('emailin').using("gin",sql`to_tsvector("english",${table.email})`),
    // usernamein:index('usernamein').using("gin",sql`to_tsvector("english",${table.username})`)
    emailin:index("emailin").on(table.email),
    usernamein:index("usernamein").on(table.username)
 }))