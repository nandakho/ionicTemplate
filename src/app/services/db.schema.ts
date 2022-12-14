export const createSchema: string = `
CREATE TABLE IF NOT EXISTS db_user (
    id INTEGER PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    role INTEGER,
    unit TEXT
);`;