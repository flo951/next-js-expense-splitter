import { sql } from '@vercel/postgres'

export const createTables = async () => {
  try {
    await sql`
     CREATE TABLE IF NOT EXISTS users (
       id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
       username varchar(30) NOT NULL UNIQUE,
      password_hash varchar(60) NOT NULL
       );
  `
    await sql`
  CREATE TABLE IF NOT EXISTS sessions (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    token varchar(90) NOT NULL UNIQUE,
   expiry_timestamp timestamp NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
   user_id integer REFERENCES users (id) ON DELETE CASCADE
    );
  `
    await sql`
  CREATE TABLE IF NOT EXISTS events (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    eventname varchar(30) NOT NULL,
    imageurl varchar(120),
   user_id integer REFERENCES users (id) ON DELETE CASCADE
    );
  `
    await sql`
  CREATE TABLE IF NOT EXISTS people (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(30) NOT NULL,
   event_id integer REFERENCES events (id) ON DELETE CASCADE,
   user_id integer REFERENCES users (id) ON DELETE CASCADE

    );
  `
    await sql`
  CREATE TABLE IF NOT EXISTS expenses (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    expensename varchar(30) NOT NULL,
   cost integer,
   event_id integer REFERENCES events (id) ON DELETE CASCADE,
   paymaster integer REFERENCES people (id) ON DELETE CASCADE

    );
  `
  } catch (error) {
    console.error('error creating tables', error)
  }
}
