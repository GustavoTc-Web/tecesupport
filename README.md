# Tecesupport

Sistema web de Help Desk desenvolvido para gerenciar o fluxo de abertura e atendimento de chamados entre clientes e analistas de suporte.

O projeto possui frontend e backend separados, autenticação com JWT, controle de acesso baseado no papel do usuário e uma interface responsiva para acompanhamento dos tickets.

## Funcionalidades

### Cliente

* Cadastro e autenticação
* Criação de chamados
* Acompanhamento de status e prioridade
* Visualização do analista responsável
* Histórico de comentários
* Edição de perfil
* Alteração de senha
* Preferências personalizadas da interface

### Analista

* Visualização da fila de atendimento
* Criação de chamados
* Atribuição de chamados ao próprio usuário
* Alteração de prioridade e status
* Registro de comentários
* Resolução de chamados
* Dashboard com visão geral dos tickets
* Edição de perfil e alteração de senha

### Recursos gerais

* Autenticação com JWT
* Controle de acesso por papel: cliente e analista
* Rotas protegidas no frontend
* API REST
* Paginação de chamados
* Tema claro, escuro e automático
* Preferências persistidas por usuário
* Interface responsiva
* Validação de formulários
* Tratamento de erros e estados de carregamento

## Tecnologias utilizadas

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT
* SQLite

### Frontend

* React
* TypeScript
* Vite
* Axios
* CSS

## Estrutura do projeto

```text
tecesupport/
├── tecesupport-back/
│   ├── apps/
│   │   ├── comments/
│   │   ├── tickets/
│   │   └── users/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
└── tecesupport-front/
    ├── src/
    │   ├── api/
    │   ├── auth/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   └── preferences/
    ├── package.json
    └── vite.config.ts
```

## Como executar o projeto

### Pré-requisitos

Antes de começar, instale:

* Python 3
* Node.js
* Git

### 1. Clonar o repositório

```bash
git clone https://github.com/GustavoTc-Web/tecesupport.git
cd tecesupport
```

### 2. Backend

Entre na pasta do backend:

```bash
cd tecesupport-back
```

Crie o ambiente virtual:

```bash
python -m venv .venv
```

Ative o ambiente virtual no Windows:

```powershell
.venv\Scripts\activate
```

Instale as dependências:

```bash
pip install -r requirements.txt
```

Execute as migrations:

```bash
python manage.py migrate
```

Inicie o servidor:

```bash
python manage.py runserver
```

O backend estará disponível em:

```text
http://127.0.0.1:8000/
```

### 3. Frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd tecesupport-front
```

Instale as dependências:

```bash
npm install
```

Inicie o projeto:

```bash
npm run dev
```

O frontend estará disponível em:

```text
http://localhost:5173/
```

## Fluxo do sistema

1. O cliente cria uma conta e abre um chamado.
2. O chamado fica disponível para atendimento.
3. Um analista assume o ticket.
4. O analista pode alterar prioridade, adicionar comentários e atualizar o atendimento.
5. O cliente acompanha o andamento e o histórico do chamado.
6. O analista finaliza o ticket quando o problema é resolvido.

## Objetivo do projeto

O Tecesupport foi desenvolvido com o objetivo de aplicar conceitos de:

* Desenvolvimento de APIs REST
* Autenticação e autorização
* Integração entre frontend e backend
* Modelagem de banco de dados
* Controle de acesso por papéis
* Componentização no React
* Regras de negócio
* Tratamento de erros
* Experiência do usuário

## Repositório

https://github.com/GustavoTc-Web/tecesupport

## Autor

Desenvolvido por Gustavo Tecedora.
