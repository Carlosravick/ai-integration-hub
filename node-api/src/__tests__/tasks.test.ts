import request from 'supertest';
import app from '../app';
import fs from 'fs/promises';
import path from 'path';

// Isolamos o serviço Python mockando o axios para evitar dependência de rede durante os testes
jest.mock('axios', () => ({
  post: jest.fn(),
}));

import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

const TASKS_FILE = path.resolve(process.cwd(), 'tasks.json');

// Garante um estado limpo no arquivo 'tasks.json' antes de cada teste para evitar interferência entre os cenários
beforeEach(async () => {
  await fs.writeFile(TASKS_FILE, '[]', 'utf-8');
});

// Remove o arquivo de banco de dados temporário para não deixar rastros no ambiente pós-testes
afterAll(async () => {
  try {
    await fs.unlink(TASKS_FILE);
  } catch {}
});

describe('GET /', () => {
  it('deve retornar mensagem "API is running"', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'API is running' });
  });
});

describe('POST /tasks', () => {
  it('deve criar uma tarefa com resumo quando os dados são válidos', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: 'AI is transforming the world.' },
    });

    const response = await request(app)
      .post('/tasks')
      .send({ text: 'A IA está transformando o mundo.', lang: 'en' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Tarefa criada com sucesso!');
    expect(response.body.task).toHaveProperty('id');
    expect(response.body.task).toHaveProperty('text');
    expect(response.body.task).toHaveProperty('summary', 'AI is transforming the world.');
    expect(response.body.task).toHaveProperty('lang', 'en');
  });

  it('deve retornar 400 quando o campo "text" não é enviado', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ lang: 'pt' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Campo "text" é obrigatório.');
  });

  it('deve retornar 400 quando o idioma não é suportado', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ text: 'Qualquer texto', lang: 'fr' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Language not supported');
  });

  it('deve retornar 400 quando o campo "lang" não é enviado', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ text: 'Qualquer texto' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Language not supported');
  });

  it('deve aceitar os idiomas pt, en e es', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: 'Resumo de teste' },
    });

    for (const lang of ['pt', 'en', 'es']) {
      const response = await request(app)
        .post('/tasks')
        .send({ text: 'Texto de teste', lang });

      expect(response.status).toBe(201);
      expect(response.body.task.lang).toBe(lang);
    }
  });
});

describe('GET /tasks', () => {
  it('deve retornar uma lista vazia quando não há tarefas', async () => {
    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('deve retornar todas as tarefas criadas', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: 'Resumo' },
    });

    await request(app).post('/tasks').send({ text: 'Tarefa 1', lang: 'pt' });
    await request(app).post('/tasks').send({ text: 'Tarefa 2', lang: 'en' });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe('GET /tasks/:id', () => {
  it('deve retornar uma tarefa específica pelo ID', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: 'Resumo' },
    });

    const created = await request(app)
      .post('/tasks')
      .send({ text: 'Texto', lang: 'pt' });

    const taskId = created.body.task.id;
    const response = await request(app).get(`/tasks/${taskId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(taskId);
    expect(response.body.text).toBe('Texto');
    expect(response.body.summary).toBe('Resumo');
    expect(response.body.lang).toBe('pt');
  });

  it('deve retornar 404 quando a tarefa não existe', async () => {
    const response = await request(app).get('/tasks/999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Tarefa não encontrada.');
  });

  it('deve retornar 400 quando o ID é inválido', async () => {
    const response = await request(app).get('/tasks/abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ID inválido.');
  });
});

describe('DELETE /tasks/:id', () => {
  it('deve remover uma tarefa pelo ID', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { summary: 'Resumo' },
    });

    const created = await request(app)
      .post('/tasks')
      .send({ text: 'Para deletar', lang: 'es' });

    const taskId = created.body.task.id;
    const deleteResponse = await request(app).delete(`/tasks/${taskId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Tarefa removida com sucesso!');

    // Confirma que a tarefa foi realmente removida
    const getResponse = await request(app).get(`/tasks/${taskId}`);
    expect(getResponse.status).toBe(404);
  });

  it('deve retornar 404 ao tentar deletar uma tarefa inexistente', async () => {
    const response = await request(app).delete('/tasks/999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Tarefa não encontrada.');
  });
});
