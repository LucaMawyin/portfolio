CREATE TABLE projects(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    languages TEXT,
    tools TEXT,
    libraries TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    tag TEXT,
    status TEXT,
    pinned BOOLEAN DEFAULT 0,
    hidden BOOLEAN DEFAULT 0,
    deleted BOOLEAN DEFAULT 0
);
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    locked_until DATETIME
);
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    ip_address TEXT,
    geo TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE login_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    geo TEXT,
    user_agent TEXT,
    serial TEXT UNIQUE,
    type TEXT NOT NULL DEFAULT 'login' CHECK (type IN ('login', 'unlock')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE tags(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    colour TEXT,
    builtin BOOLEAN DEFAULT FALSE,
    category TEXT NOT NULL CHECK (
        category IN ('project', 'experience', 'status')
    ),
    UNIQUE(name, category)
);
CREATE TABLE tech(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (
        category IN ('languages', 'libraries', 'tools')
    )
);
CREATE TABLE site_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL
);
CREATE TABLE experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tag TEXT,
    city TEXT,
    region TEXT,
    start_date INTEGER NOT NULL,
    end_date INTEGER,
    hidden BOOLEAN DEFAULT 0,
    status TEXT,
    status_colour TEXT
);