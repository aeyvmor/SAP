# css100 capstone project lel

basically a SAP dashboard demo that uses python backend that handles the api and database functions and nextjs frontend as the tech stack.

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed

- Node.js and pnpm installed (for local frontend development)

- Python 3.12 installed (for local backend development)

### Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd SAP
   ```

2. **Set Up Environment Variables**

   - Create a `.env` file in the `backend` directory with the following content:

     ```env
     DATABASE_URL="postgresql://postgres:admin@postgres/sap"
     ```

   - Create a `.env` file in the `frontend` directory with the following content:

     ```env
      NODE_ENV=development
      NEXT_PUBLIC_NODE_ENV=development
      NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

3. **Build and Run Docker Containers**

   ```bash
   docker compose up --build
   ```

4. **Access the Application**

   - Backend: [http://localhost:8000](http://localhost:8000)
   - Frontend: [http://localhost:3000](http://localhost:3000)

5. **Seed Database**

    ```bash
    docker exec -it backend_service bash
    pip install faker
    cd /app
    python ./test/seed_database.py
    ```

6. **Stop and Remove Containers**

   ```bash
   docker compose down -v
   ```
