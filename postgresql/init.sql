CREATE DATABASE babaktodo;

\c babaktodo;

CREATE TABLE todo(
    todo_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    tag VARCHAR(50)
);