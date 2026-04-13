import React, { Fragment, useEffect, useState } from "react";
import EditTodo from "./EditTodo";
import { fireConfetti } from "./InputTodo";
import "./style.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ListTodo = () => {
  const [todos, setTodos]   = useState([]);
  const [doneIds, setDoneIds] = useState([]);

  const getTodos = async () => {
    try {
      const response = await fetch(`${BASE_URL}todos`);
      const jsonData = await response.json();
      setTodos(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  const deleteTodo = async (id) => {
    const el = document.getElementById(`todo-item-${id}`);
    if (el) {
      el.style.transition = "all 0.25s";
      el.style.opacity = "0";
      el.style.transform = "translateX(30px) scale(0.9)";
    }
    setTimeout(async () => {
      try {
        await fetch(`${BASE_URL}todos/${id}`, { method: "DELETE" });
        setTodos((prev) => prev.filter((t) => t.todo_id !== id));
        setDoneIds((prev) => prev.filter((d) => d !== id));
      } catch (err) {
        console.error(err.message);
      }
    }, 230);
  };

  const toggleDone = (id) => {
    if (doneIds.includes(id)) {
      setDoneIds((prev) => prev.filter((d) => d !== id));
    } else {
      setDoneIds((prev) => [...prev, id]);
      fireConfetti();
    }
  };

  const total     = todos.length;
  const doneCount = doneIds.length;
  const openCount = total - doneCount;

  const colorOf = (index) => `color-${index % 5}`;

  return (
    <Fragment>
      <style>{`
        @keyframes confettiFall {
          0%   { opacity:1; transform:translateY(0) rotate(0deg); }
          100% { opacity:0; transform:translateY(100vh) rotate(720deg); }
        }
      `}</style>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card stat-all">
          <div className="stat-num">{total}</div>
          <div className="stat-label">TOTAL</div>
        </div>
        <div className="stat-card stat-done">
          <div className="stat-num">{doneCount}</div>
          <div className="stat-label">DONE ✓</div>
        </div>
        <div className="stat-card stat-open">
          <div className="stat-num">{openCount}</div>
          <div className="stat-label">PENDING</div>
        </div>
      </div>

      {/* List */}
      <div className="list-wrap">
        {todos.length === 0 ? (
          <div className="list-empty">
            <span className="empty-icon">🎉</span>
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          todos.map((todo, index) => {
            const isDone = doneIds.includes(todo.todo_id);
            return (
              <div
                key={todo.todo_id}
                id={`todo-item-${todo.todo_id}`}
                className={`todo-item ${colorOf(index)}`}
              >
                {/* Checkbox */}
                <div
                  className={`todo-check ${isDone ? "checked" : ""}`}
                  onClick={() => toggleDone(todo.todo_id)}
                  title="Mark as done"
                >
                  {isDone && (
                    <svg viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>

                {/* Description */}
                <div className={`todo-description ${isDone ? "done" : ""}`}>
                  {todo.description}
                </div>

                {/* Tag badge + Edit button (rendered by EditTodo) */}
                <EditTodo todo={todo} />

                {/* Delete button */}
                <button
                  className="btn-icon btn-delete"
                  onClick={() => deleteTodo(todo.todo_id)}
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm13-15h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            );
          })
        )}

        {todos.length > 0 && (
          <div className="footer-brand">
            Built with <span>♥</span> by Clarusway · Project 208
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default ListTodo;
