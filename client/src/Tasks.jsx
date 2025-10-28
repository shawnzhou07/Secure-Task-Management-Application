import './index.css'
import React, { useState, useEffect } from 'react'

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("to_do");
    const [priority, setPriority] = useState("low");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            } else {
                setErrorMessage("Failed to fetch tasks");
            }
        } catch (error) {
            setErrorMessage("Network error");
            console.error('Fetch error:', error);
        }
    }

    async function createTask() {
        setErrorMessage("");
        setSuccessMessage("");

        if (title.length === 0) {
            setErrorMessage("Title cannot be empty!");
            return;
        }

        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:8000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, status, priority })
            });

            if (response.ok) {
                setSuccessMessage("Task created!");
                setTitle("");
                setStatus("to_do");
                setPriority("low");
                fetchTasks();
            } else {
                setErrorMessage("Failed to create task");
            }
        } catch (error) {
            setErrorMessage("Network error");
            console.error('Fetch error:', error);
        }
    }

    async function deleteTask(taskId) {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://localhost:8000/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setSuccessMessage("Task deleted!");
                fetchTasks();
            } else {
                setErrorMessage("Failed to delete task");
            }
        } catch (error) {
            setErrorMessage("Network error");
            console.error('Fetch error:', error);
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    return (
        <div className="container">
            <header>
                <h1>Task Manager</h1>
                <button onClick={handleLogout} style={{float: 'right'}}>Logout</button>
            </header>

            <div className="create-task-section">
                <h2>Create New Task</h2>
                <label>Title:</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Enter task title"
                />

                <label>Status:</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="to_do">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <label>Priority:</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <button onClick={createTask}>Create Task</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
            </div>

            <div className="tasks-list">
                <h2>Your Tasks</h2>
                {tasks.length === 0 ? (
                    <p>No tasks yet. Create one above!</p>
                ) : (
                    tasks.map(task => (
                        <div key={task.id} className="task-item">
                            <h3>{task.title}</h3>
                            <p>Status: {task.status.replace('_', ' ')}</p>
                            <p>Priority: {task.priority}</p>
                            <button onClick={() => deleteTask(task.id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Tasks;