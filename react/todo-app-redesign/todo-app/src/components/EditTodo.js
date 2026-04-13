import React, { Fragment, useState } from "react";
import { TAGS } from "./InputTodo";
import "./style.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const EditTodo = ({ todo }) => {
  const [description, setDescription] = useState(todo.description);
  const [selectedTag, setSelectedTag]  = useState(todo.tag || null);
  const [isOpen, setIsOpen]            = useState(false);

  const currentTag = TAGS.find((t) => t.value === todo.tag);

  const updateTodo = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${BASE_URL}todos/${todo.todo_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, tag: selectedTag }),
      });
      setIsOpen(false);
      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleClose = () => {
    setDescription(todo.description);
    setSelectedTag(todo.tag || null);
    setIsOpen(false);
  };

  return (
    <Fragment>
      {/* Tag badge shown in the list row */}
      {currentTag ? (
        <span className={`todo-tag ${currentTag.colorClass}`}>
          {currentTag.label}
        </span>
      ) : (
        <span className="todo-tag color-2">✅ Task</span>
      )}

      {/* Edit button */}
      <div className="action-btns">
        <button
          className="btn-icon btn-edit"
          onClick={() => setIsOpen(true)}
          title="Edit"
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      </div>

      {/* Edit modal */}
      {isOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="modal-box">
            <h3 className="modal-title">✏️ Edit Task</h3>

            <input
              type="text"
              className="modal-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") updateTodo(e); }}
              autoFocus
            />

            <div className="tag-selector">
              {TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag.value}
                  className={`tag-option ${tag.colorClass}${selectedTag === tag.value ? " selected" : ""}`}
                  onClick={() => setSelectedTag(selectedTag === tag.value ? null : tag.value)}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            <div className="modal-footer">
              <button className="modal-btn modal-btn-cancel" onClick={handleClose}>
                Cancel
              </button>
              <button className="modal-btn modal-btn-save" onClick={updateTodo}>
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default EditTodo;
