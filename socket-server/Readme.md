# Go Socket Server

Go backend comunicate with Assembly for real time transcript.

---

## 🚀 Getting Started

### Create a .env file :

<pre lang="md"><code>
PORT=9090
FRONTEND_URL=http://localhost:3000
ASSEMBLYAI_API_KEY=your_api_assembly_key
</code></pre>

### Build image:
````bash
docker build -t transcript-socket-server .
````

### Run image:

run in socket-server/ to use .env file

````bash
docker run --env-file .env -p 9090:9090 transcript-socket-server
````
