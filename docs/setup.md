# Setup

## Requirements
- Node.js v22+
- Go v1.22+ ( or just using Docker for running the socket server)
- Docker
- A Supabase project with the necessary tables and API keys
- AssemblyAI API key for transcription services

## Steps
1. Install dependencies
   ```bash
   npm ci 
   ```
2. Create a `.env` file in the root directory: 
   ```env
    NEXT_PUBLIC_WS_SERVER_URL=http://localhost:9090
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3. Start the Next.js development server
    ```bash
    npm run dev
    ```
4. Open your browser and navigate to `http://localhost:3000` to view the Next.js application.

5. Start the Go Socket Server
    - Navigate to the `socket-server/` directory

    ```bash
    cd socket-server
    ```
    - Create a `.env` file in the `socket-server/` directory:
        ```env
        PORT=9090
        FRONTEND_URL=http://localhost:3000
        ASSEMBLYAI_API_KEY=your_api_assembly_key
        ```
    - Run by using go directly:
        ```bash
        go run main.go
        ```
    - Or build and run using Docker:
        ```bash
        docker build -t transcript-socket-server .
        docker run --env-file .env -p 9090:9090 transcript-socket-server
        ```
6. Migrate database
    - Use Supabase CLI to set up the database schema as per the provided SQL scripts in the `supabase/migrations/` directory.
    ```bash
    npx supabase link --project-ref your_project_ref
    npx supabase db push
    ```

