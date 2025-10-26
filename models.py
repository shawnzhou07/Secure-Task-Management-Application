CREATE_USERS_TABLE = """

CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

"""

CREATE_TASKS_TABLE = """

CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('to_do', 'in_progress', 'done') NOT NULL DEFAULT 'to_do',
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

"""