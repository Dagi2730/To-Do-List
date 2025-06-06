// ToDoList.jsx
import React, { useState, useEffect } from "react";
import './index.css';

function ToDoList() {
  // Task structure: { text: string, completed: bool }
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editText, setEditText] = useState("");

  // Load tasks from localStorage on mount
    useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (savedTasks) setTasks(savedTasks);
    }, []);

  // Save tasks to localStorage whenever tasks change
    useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    function handleInputChange(event) {
    setNewTask(event.target.value);
    }

    function addTask() {
    if (newTask.trim() !== "") {
    setTasks((t) => [...t, { text: newTask.trim(), completed: false }]);
    setNewTask("");
    }
}

    function deleteTask(index) {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
}

    function moveTaskUp(index) {
        if (index > 0) {
        const updatedTasks = [...tasks];
        [updatedTasks[index], updatedTasks[index - 1]] = [updatedTasks[index - 1], updatedTasks[index]];
        setTasks(updatedTasks);
    }
}

    function moveTaskDown(index) {
        if (index < tasks.length - 1) {
        const updatedTasks = [...tasks];
        [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
        setTasks(updatedTasks);
    }
}

    function toggleComplete(index) {
        const updatedTasks = [...tasks];
        updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
}

    function startEditing(index) {
        setEditIndex(index);
        setEditText(tasks[index].text);
}

    function cancelEditing() {
        setEditIndex(null);
        setEditText("");
}

    function saveEdit(index) {
        if (editText.trim() === "") return; // Don't allow empty task text
        const updatedTasks = [...tasks];
        updatedTasks[index].text = editText.trim();
        setTasks(updatedTasks);
        setEditIndex(null);
        setEditText("");
}

  // Search filter
    const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchTerm.toLowerCase())
);

  // Export tasks to JSON file
    function exportTasks() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = "tasks.json";
        a.click();
}

  // Import tasks from JSON file
    function importTasks(event) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
        try {
        const importedTasks = JSON.parse(e.target.result);
        // Validate imported tasks
        if (Array.isArray(importedTasks) && importedTasks.every(t => typeof t.text === 'string' && typeof t.completed === 'boolean')) {
            setTasks(importedTasks);
        } else {
            alert("Invalid task file format.");
        }
    } catch {
        alert("Failed to parse JSON.");
    }
    };
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
    // Reset the input value so the same file can be uploaded again if needed
    event.target.value = "";
}

return (
    <div className="to-do-list">
    <h1>TO-DO-LIST</h1>

    <div className="top-controls">
        <input
        type="text"
        placeholder="Enter a task..."
        value={newTask}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button className="add-button" onClick={addTask}>Add</button>
    </div>

    <div className="search-export-import">
        <input
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="search-input"
        />
        <button onClick={exportTasks} className="export-button">Export</button>
        <label htmlFor="import-tasks" className="import-label">Import</label>
        <input
        id="import-tasks"
        type="file"
        accept="application/json"
        onChange={importTasks}
        style={{ display: "none" }}
        />
    </div>

    <ol>
        {filteredTasks.length === 0 && <li>No tasks found.</li>}
        {filteredTasks.map((task, index) => {
          // Since filteredTasks may not be same order as tasks, find actual index:
        const actualIndex = tasks.indexOf(task);
        return (
            <li key={actualIndex}>
            {editIndex === actualIndex ? (
                <>
                <input
                    className="edit-input"
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(actualIndex);
                    else if (e.key === "Escape") cancelEditing();
                    }}
                    autoFocus
                />
                <button onClick={() => saveEdit(actualIndex)} className="save-button">Save</button>
                <button onClick={cancelEditing} className="cancel-button">Cancel</button>
                </>
            ) : (
                <>
                <span
                    className={`text ${task.completed ? "completed" : ""}`}
                    onClick={() => toggleComplete(actualIndex)}
                    title="Click to toggle complete"
                >
                    {task.text}
                </span>
                <button className="edit-button" onClick={() => startEditing(actualIndex)}>Edit</button>
                <button className="delete-button" onClick={() => deleteTask(actualIndex)}>Delete</button>
                <button className="move-button" onClick={() => moveTaskUp(actualIndex)}>☝️</button>
                <button className="move-button" onClick={() => moveTaskDown(actualIndex)}>👇</button>
                </>
            )}
            </li>
        );
        })}
    </ol>
    </div>
);
}

export default ToDoList;
