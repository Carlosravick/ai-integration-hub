# LLM Summarizer API

Este projeto é uma API Node.js desenvolvida com TypeScript e Express, que permite aos usuários submeter textos e receber resumos gerados por um serviço Python utilizando LangChain.
O resumo gerado é salvo com o texto original e a versao resumida e traduzido conforme o idioma solicitado pelo usuário.

## Estrutura do Projeto

- **node-api/**: Contém a implementação da API Node.js.
  - **src/**: Contém o código-fonte da API.
    - **app.ts**: Ponto de entrada da aplicação.
    - **index.ts**: Inicia o servidor.
    - **routes/**: Define as rotas da API.
      - **tasksRoutes.ts**: Gerencia as rotas relacionadas a tarefas.
    - **repositories/**: Gerencia as tarefas em memória.
      - **tasksRepository.ts**: Implementa a lógica de armazenamento de tarefas.
- **python-llm/**: Contém a implementação do serviço Python.
  - **app/**: Contém o código-fonte do serviço Python.
    - **main.py**: Ponto de entrada da aplicação FastAPI.
    - **services/**: Implementa a lógica de resumo de texto.
      - **llm_service.py**: Interage com LangChain para gerar resumos.

## Environment

**HF_TOKEN**: Token de acesso ao Hugging Face(https://huggingface.co/settings/tokens). Caso não tenha, crie uma conta e gere um token(gratuito).

## Como Executar

1. Clone o repositório.
2. Navegue até o diretório do projeto.
3. Instale as dependências dos projetos Node.js e Python:
   ```bash
   ./setup.sh install-node
   ./setup.sh install-python
   ```
4. Inicie a API Node.js e o serviço Python:
   ```bash
   ./setup.sh start-node
   ./setup.sh start-python
   ```
5. A API estará disponível em `http://localhost:3005`.

## Endpoints

- POST **/tasks**: Cria uma nova tarefa com o texto a ser resumido.
- GET **/tasks**: Lista todas as tarefas criadas.

# Tarefas a serem realizadas

### No projeto Node.js

- No POST **/tasks**, a API deve receber um texto e um idioma e enviar para o serviço Python para gerar o resumo no idioma solicitado.

  #### Parâmetros que devem ser recebidos pela API:

  - `text`: Texto a ser resumido.
  - `lang`: Idioma para qual o texto original deve ser traduzido.

  #### Idiomas suportados:

  - `pt`: Português.
  - `en`: Inglês.
  - `es`: Espanhol.
  - Caso o idioma não seja suportado, retornar um erro com status 400 e a mensagem "Language not supported".

- Deve ser possível acessar o resumo de uma tarefa através do endpoint GET **/tasks/:id**.

  ### Deve retornar um JSON com as propriedades:

  - `id`: Identificador da tarefa.
  - `text`: Texto original.
  - `summary`: Resumo gerado pelo serviço Python.
  - `lang`: Idioma para qual o texto foi traduzido(solicitado pelo usuário).

- Deve ser possível remover uma tarefa através do endpoint DELETE **/tasks/:id**.
- Persistir as informações das tarefas em um arquivo JSON.

### No projeto Python

- Implementar a lógica de resumo de texto utilizando LangChain(Prompt) no idioma solicitado.
  ### O resumo deve ser retornado em formato JSON, com a propriedades:
  - `summary`: Resumo gerado.

## Em ambos os projetos

- Deve possuir uma rota inicial(/) que retorne um JSON com a propriedade `message` contendo a mensagem "API is running".

### Observações

- Após a conclusão, suba o projeto no seu repositório pessoal e envie o link para o recrutador.
- Caso tenha alguma dúvida, entre em contato com o recrutador.

## Texto de Exemplo

```
Diagnósticos médicos e decisões jurídicas: o papel da IA
A justiça e a Medicina são considerados campos de alto risco. Neles é mais urgente do que em qualquer outra área estabelecer sistemas para que os humanos tenham sempre a decisão final.

Os especialistas em IA trabalham para garantir a confiança dos usuários, para que o sistema seja transparente, que proteja as pessoas e que os humanos estejam no centro das decisões.

Aqui entra em jogo o desafio do "doutor centauro". Centauros são modelos híbridos de algoritmo que combinam análise formal de máquina e intuição humana.

Um "médico centauro + um sistema de IA" melhora as decisões que os humanos tomam por conta própria e que os sistemas de IA tomam por conta própria.

O médico sempre será quem aperta o botão final; e o juiz quem determina se uma sentença é justa.
```
FONTE: https://www.bbc.com/portuguese/articles/c2kx2e74jyxo

# Desejamos um bom desafio! 🚀

---

# Implementação

## O que foi feito

### Node.js (TypeScript/Express)
- **POST /tasks**: Recebe `text` e `lang`, valida o idioma (`pt`, `en`, `es`), salva a tarefa e envia ao serviço Python para gerar o resumo traduzido.
- **GET /tasks**: Lista todas as tarefas criadas.
- **GET /tasks/:id**: Retorna uma tarefa específica com `id`, `text`, `summary` e `lang`.
- **DELETE /tasks/:id**: Remove uma tarefa pelo ID.
- **GET /**: Rota raiz retornando `{"message": "API is running"}`.
- **Persistência**: Tarefas salvas em arquivo `tasks.json` utilizando `fs/promises` (operações assíncronas).

### Python (FastAPI)
- **POST /summarize**: Recebe `text` e `lang`, utiliza LangChain (`PromptTemplate`) para gerar o resumo traduzido via HuggingFace (modelo Qwen/Qwen2.5-72B-Instruct).
- **GET /**: Rota raiz retornando `{"message": "API is running"}`.

## Decisões Técnicas
- **InferenceClient** do `huggingface_hub` para chamadas à API de IA (mais estável que a compatibilidade OpenAI).
- **Ambiente virtual** (`.venv`) para isolar dependências Python.
- **Variáveis de ambiente** (`.env`) para proteger o token do HuggingFace.
- **Testes automatizados** com Jest + Supertest (13 testes cobrindo todos os endpoints).

## Como Rodar os Testes
```bash
cd node-api
npm test
```
