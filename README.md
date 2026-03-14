# Tecesupport

Sistema de Help Desk desenvolvido para gerenciamento de tickets de suporte.

O projeto permite que usuários criem tickets, acompanhem o status e adicionem comentários para resolver problemas de forma organizada.

---

## Tecnologias utilizadas

### Backend
- Python
- Django
- Django REST Framework

### Frontend
- React
- TypeScript
- Vite

### Banco de dados
- PostgreSQL / SQLite (desenvolvimento)

---

## Funcionalidades

- Criação de tickets
- Atualização de status
- Sistema de comentários
- Associação de usuários aos tickets
- API REST para integração com frontend

---

## Estrutura do projeto

tecesupport
├── backend
│ ├── apps
│ ├── config
│ └── manage.py
│
└── frontend
├── src
├── package.json
└── vite.config.ts


---

## Como rodar o projeto

### Backend

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
