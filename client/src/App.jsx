import axios from "axios";
import './App.css';
import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API_URL; // from client/.env
export default function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API}/api/tasks`);
                if (!res.ok) throw new Error("Server replied " + res.status); 
                setTasks(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []); 
    async function addTask(e) {
        e.preventDefault();
        const res = await fetch(`${API}/api/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title })
        });
        const created = await res.json();
        setTasks([...tasks, created]); 
        setTitle("");
    }
    async function toggle(task) {
        const res = await fetch(`${API}/api/tasks/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ done: !task.done })
        });
        const updated = await res.json();
        setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
    }
    async function remove(id) {
        await fetch(`${API}/api/tasks/${id}`, { method: "DELETE" });
        setTasks(tasks.filter(t => t.id !== id));
    }
    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>Could not load tasks: {error}</p>;
    return (
        <div className="task-Manager">
            <div className=" card"> 
            <h1>Testware Task Manager</h1>
            <form onSubmit={addTask}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task" />
                <button type="submit">Add</button>
            </form>
            </div>
            <ul className="card">
                <h2>Task List</h2>
                {tasks.map(t => (
                    <li key={t.id}>
                        
                        <span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
                        <button style={{ backgroundColor: t.done ? "brown" : " rgb(21, 21, 84)"  }} onClick={() => toggle(t)}>{t.done ? "Undo" : "Done"}</button>
                        <button onClick={() => remove(t.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
