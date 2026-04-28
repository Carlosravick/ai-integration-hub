import { Router, Request, Response } from "express";
import { TasksRepository } from "../repositories/tasksRepository";
import axios from "axios";

const router = Router();
const tasksRepository = new TasksRepository();

const SUPPORTED_LANGS = ["pt", "en", "es"];
const PYTHON_API_URL = "http://localhost:8000";

// POST: Cria uma tarefa e solicita resumo ao serviço Python
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { text, lang } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Campo "text" é obrigatório.' });
    }
    
    if (!lang || !SUPPORTED_LANGS.includes(lang)) {
      return res.status(400).json({ error: 'Language not supported' });
    }

    // Cria a "tarefa" no banco de dados (JSON)
    const task = await tasksRepository.createTask(text, lang);

    // Solicita o resumo do texto ao serviço Python
    try {
      const response = await axios.post(`${PYTHON_API_URL}/summarize`, {
        text,
        lang
      });
      
      const summary = response.data.summary;
      
      // Atualiza a tarefa com o resumo retornado pela IA
      const updatedTask = await tasksRepository.updateTaskSummary(task.id, summary);
      
      return res.status(201).json({
        message: "Tarefa criada com sucesso!",
        task: updatedTask,
      });
    } catch (pythonError) {
      console.error("Erro no serviço Python:", pythonError);
      return res.status(502).json({ 
        error: "Ocorreu um erro ao comunicar com o serviço de IA.",
        task: task // Retorna a tarefa salva (sem resumo) em caso de erro na IA
      });
    }
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return res.status(500).json({ error: "Ocorreu um erro interno ao criar a tarefa." });
  }
});

// GET: Lista todas as tarefas
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const tasks = await tasksRepository.getAllTasks();
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar tarefas." });
  }
});

// GET: Busca uma tarefa específica por ID
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const task = await tasksRepository.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar a tarefa." });
  }
});

// DELETE: Remove uma tarefa por ID
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const deleted = await tasksRepository.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    return res.json({ message: "Tarefa removida com sucesso!" });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao remover a tarefa." });
  }
});

export default router;
