# FileX Converter (Full Stack)
- Front: http://localhost:3000
- API:   http://localhost:4000
- Redis: interno (sem porta exposta)

Subir:
  docker compose up -d --build

Testar no navegador:
  http://localhost:3000

Ping API:
  curl -s http://localhost:4000/health
