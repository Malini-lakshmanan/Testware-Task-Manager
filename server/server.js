require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// GET - Fetch all tasks
app.get("/api/tasks", (req, res) => {
    db.query("SELECT * FROM tasks ORDER BY id", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const tasks = results.map(task => ({
            ...task,
            done: Boolean(task.done)
        }));

        res.json(tasks);
    });
});

// POST - Add task
app.post("/api/tasks", (req, res) => {
    const title = (req.body.title || "").trim();

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    db.query(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        [title, false],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                id: result.insertId,
                title: title,
                done: false
            });
        }
    );
});

// PUT - Update task
app.put("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const done = Boolean(req.body.done);

    db.query(
        "UPDATE tasks SET done = ? WHERE id = ?",
        [done, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            db.query(
                "SELECT * FROM tasks WHERE id = ?",
                [id],
                (err, rows) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.json({
                        ...rows[0],
                        done: Boolean(rows[0].done)
                    });
                }
            );
        }
    );
});

// DELETE - Delete task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    db.query("DELETE FROM tasks WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.status(204).end();
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});