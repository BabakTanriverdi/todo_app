import React, { Fragment } from "react";
import Header from "./components/Header";
import InputTodo from "./components/InputTodo";
import ListTodo from "./components/ListTodo";
import "./App.css";

function App() {
  return (
    <Fragment>
      <div className="app-wrap">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="confetti-wrap" id="confetti-wrap"></div>
        <div className="app-container">
          <Header />
          <InputTodo />
          <ListTodo />
        </div>
      </div>
    </Fragment>
  );
}

export default App;
