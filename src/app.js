import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import alunoRoutes from './routes/aluno.routes.js';
import funcionarioRoutes from './routes/funcionario.routes.js';
import escolaRoutes from './routes/escola.routes.js';

const app = express();

// Configuração de CORS para produção
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Vite dev server alternativo
    'https://eduonweb.netlify.app', // Netlify
    'https://eduonweb.netlify.app/' // Netlify com barra
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(json());

// Rota raiz para evitar "Cannot GET /"
const apiInfo = {
  message: 'API EDUON funcionando! 🚀',
  version: '1.0.0',
  endpoints: {
    auth: '/api/auth',
    alunos: '/api/alunos',
    funcionarios: '/api/funcionarios',
    escola: '/api/escola'
  }
};

app.get('/', (req, res) => {
  res.json(apiInfo);
});

app.get('/api', (req, res) => {
  res.json(apiInfo);
});

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/escola', escolaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API EDUON rodando na porta ${PORT}`));
