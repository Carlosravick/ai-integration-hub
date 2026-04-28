import fs from 'fs/promises';
import path from 'path';

export interface Task {
  id: number;
  text: string;
  summary: string | null;
  lang: string;
}

const FILE_PATH = path.resolve(process.cwd(), 'tasks.json');

export class TasksRepository {
  private async readTasks(): Promise<Task[]> {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeTasks(tasks: Task[]): Promise<void> {
    await fs.writeFile(FILE_PATH, JSON.stringify(tasks, null, 2), 'utf-8');
  }

  async createTask(text: string, lang: string): Promise<Task> {
    const tasks = await this.readTasks();
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const task: Task = { id: newId, text, summary: null, lang };
    
    tasks.push(task);
    await this.writeTasks(tasks);
    return task;
  }

  async updateTaskSummary(id: number, summary: string): Promise<Task | null> {
    const tasks = await this.readTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex > -1) {
      tasks[taskIndex].summary = summary;
      await this.writeTasks(tasks);
      return tasks[taskIndex];
    }
    
    return null;
  }

  async getTaskById(id: number): Promise<Task | null> {
    const tasks = await this.readTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.readTasks();
  }

  async deleteTask(id: number): Promise<boolean> {
    const tasks = await this.readTasks();
    const initialLength = tasks.length;
    const filteredTasks = tasks.filter(t => t.id !== id);
    
    if (filteredTasks.length < initialLength) {
      await this.writeTasks(filteredTasks);
      return true;
    }
    
    return false;
  }
}