import React, { Fragment, useState } from "react";
import "./style.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const TAGS = [
  { label: "🔥 Acil",   value: "acil",   colorClass: "color-0" },
  { label: "💡 Fikir",  value: "fikir",  colorClass: "color-1" },
  { label: "✅ Görev",  value: "gorev",  colorClass: "color-2" },
  { label: "📌 Önemli", value: "onemli", colorClass: "color-3" },
  { label: "🌟 Hedef",  value: "hedef",  colorClass: "color-4" },
];

export const fireConfetti = () => {
  const wrap = document.getElementById("confetti-wrap");
  if (!wrap) return;
  const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#c77dff", "#ff9a3c"];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement("div");
    el.style.cssText = `
      position:absolute;width:8px;height:8px;border-radius:2px;
      left:${Math.random() * 100}%;top:-10px;
      background:${colors[i % colors.length]};
      animation:confettiFall ${0.8 + Math.random() * 0.8}s ${Math.random() * 0.3}s linear forwards;
    `;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
};

const InputTodo = () => {
  const [description, setDescription] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [error, setError] = useState("");

  const submitForm = async (e) => {
    e.preventDefault();
    if (!description.trim()) { setError("Lütfen bir görev girin!"); return; }
    if (!selectedTag)         { setError("Lütfen bir etiket seçin!"); return; }
    setError("");

    try {
      await fetch(`${BASE_URL}todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, tag: selectedTag }),
      });
      setDescription("");
      setSelectedTag(null);
      fireConfetti();
      window.location = "/";
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <style>{`
        @keyframes confettiFall {
          0%   { opacity:1; transform:translateY(0) rotate(0deg); }
          100% { opacity:0; transform:translateY(100vh) rotate(720deg); }
        }
      `}</style>

      <div className="input-card">
        <form onSubmit={submitForm}>
          <div className="input-row">
            <input
              type="text"
              className="todo-input"
              placeholder="Yeni görev ekle... 🎯"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit" className="add-btn">
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M19 11H13V5a1 1 0 0 0-2 0v6H5a1 1 0 0 0 0 2h6v6a1 1 0 0 0 2 0v-6h6a1 1 0 0 0 0-2z"/>
              </svg>
              Ekle
            </button>
          </div>

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

          {error && <p className="error-msg">⚠️ {error}</p>}
        </form>
      </div>
    </Fragment>
  );
};

export default InputTodo;
