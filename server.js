import express from "express";
import cors from "cors";
import fs from "fs";
const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cors());
app.get("/todos", (req, res) => {
  try {
    const fileData = fs.readFileSync("./data/todos.json", "utf-8");
    let todos = JSON.parse(fileData);

    const { status, search } = req.query;

    // Status bo'yicha filter
    if (status) {
      if (status !== "active" && status !== "complete") {
        return res.status(400).json({ message: "Status faqat 'active' yoki 'complete' bo'lishi mumkin!" });
      }
      todos = todos.filter((todo) => todo.status === status);
    }
    if (search) {
      todos = todos.filter((todo) =>
        todo.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
});

app.post("/todos", (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title kiritilishi shart!" });
    }

    const fileData = fs.readFileSync("./data/todos.json", "utf-8");
    const todos = JSON.parse(fileData);

    const newTodo = {
      id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
      title: title.trim(),
      createdAt: new Date().toISOString(),
      status: "active"
    };

    todos.push(newTodo);
    fs.writeFileSync("./data/todos.json", JSON.stringify(todos, null, 2));

    res.status(201).json({
      message: "Todo muvaffaqiyatli yaratildi!",
      todo: newTodo
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
});

app.patch("/todos/complete-all", (req, res) => {
  try {
    const fileData = fs.readFileSync("./data/todos.json", "utf-8");
    const todos = JSON.parse(fileData);
    if (todos.length === 0) {
      return res.status(404).json({ message: "Todolar mavjud emas!" });
    }
    todos.forEach((todo) => {
      todo.status = "complete";
    });
    fs.writeFileSync("./data/todos.json", JSON.stringify(todos, null, 2));
    res.status(200).json({
      message: "Barcha todo'lar complete qilindi!",
      todos: todos
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
});

app.patch("/todos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "active" && status !== "complete") {
      return res.status(400).json({ message: "Status notogri!" });
    }
    const fileData = fs.readFileSync("./data/todos.json", "utf-8");
    const todos = JSON.parse(fileData);
    const todoIndex = todos.findIndex((todo) => todo.id === Number(id));

    if (todoIndex === -1) {
      return res.status(404).json({ message: "Todo topilmadi!" });
    }
    todos[todoIndex].status = status;
    fs.writeFileSync("./data/todos.json", JSON.stringify(todos, null, 2));
    res.status(200).json({
      message: "Status ozgartirildi!",
      todo: todos[todoIndex]
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
});

app.delete("/todos/complete", (req, res) => {
  try {
    const fileData = fs.readFileSync("./data/todos.json", "utf-8");
    const todos = JSON.parse(fileData);
    const activeTodos = todos.filter((todo) => todo.status !== "complete");
    if (todos.length === activeTodos.length) {
      return res.status(404).json({ message: "Bajarilgan todo'lar topilmadi!" });
    }
    fs.writeFileSync("./data/todos.json", JSON.stringify(activeTodos, null, 2));
    res.status(200).json({
      message: "Bajarilgan todo'lar o'chirildi!",
      todos: activeTodos
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
});

app.delete("/todos", (req, res) => {
  try {
    fs.writeFileSync("./data/todos.json", JSON.stringify([], null, 2));
    res.status(200).json({
      message: "Barcha todo'lar tozalandi!",
      todos: []
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda...`);
});