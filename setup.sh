#!/bin/bash

# Função para instalar dependências do Node.js
install_node() {
    echo "Instalando dependências do Node.js..."
    cd node-api || exit
    npm install
    cd - || exit
}

# Função para ativar o ambiente virtual de forma compatível
activate_venv() {
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        source .venv/Scripts/activate
    else
        source .venv/bin/activate
    fi
}

# Função para instalar dependências do Python de forma segura (com venv)
install_python() {
    echo "Instalando dependências do Python..."
    # Cria o ambiente virtual na raiz do projeto, se não existir
    if [ ! -d ".venv" ]; then
        python -m venv .venv
    fi
    
    # Ativa o ambiente para isolar a instalação
    activate_venv
    
    cd python-llm || exit
    pip install -r requirements.txt
    cd - || exit
}

# Função para executar o servidor Node.js
start_node() {
    echo "Iniciando servidor Node.js..."
    cd node-api || exit
    npm run dev
    cd - || exit
}

# Função para executar o servidor Python
start_python() {
    echo "Iniciando servidor Python..."
    # Ativa o ambiente virtual antes de rodar o uvicorn
    activate_venv
    
    cd python-llm || exit
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

# Verifica o comando passado como argumento
case $1 in
    install-node)
        install_node
        ;;
    install-python)
        install_python
        ;;
    install)
        install_node
        install_python
        ;;
    start-node)
        start_node
        ;;
    start-python)
        start_python
        ;;
    *)
        echo "Comando inválido. Use um dos seguintes:"
        echo "  install-node     - Instala dependências do Node.js"
        echo "  install-python   - Instala dependências do Python no ambiente virtual"
        echo "  install          - Instala todas as dependências"
        echo "  start-node       - Inicia o servidor Node.js"
        echo "  start-python     - Inicia o servidor Python"
        ;;
esac
