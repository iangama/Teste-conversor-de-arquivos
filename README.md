FileX Converter
Sobre o projeto

Conversor de arquivos completo, desenvolvido com Node.js, React e Docker. Suporte a múltiplos formatos e processamento assíncrono com Redis e BullMQ. Arquitetura em containers para fácil deploy e escalabilidade.

Funcionalidades

Upload de arquivos pela interface web.
Conversões suportadas: DOCX para PDF, XLSX para CSV e PNG/JPG para WEBP.
Status em tempo real de cada job.
Download seguro do arquivo convertido.

Tecnologias utilizadas

Backend: Node.js, Express, Multer, BullMQ, Redis.
Frontend: React, Vite.
Conversões: LibreOffice, Sharp, XLSX.
Infraestrutura: Docker, Docker Compose, Nginx.

Como rodar localmente

Clonar o repositório e entrar na pasta.
Subir os containers com Docker Compose.
Acessar API em http://localhost:4000
 e frontend em http://localhost:3001
.

Estrutura

api → Servidor Express com rotas de upload, status e download.
worker → Worker que processa os jobs da fila.
web → Interface web em React + Vite.
docker-compose.yml → Orquestra toda a stack.

Autor

Ian Gama – GitHub @iangama
