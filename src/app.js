import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import alunoRoutes from './routes/aluno.routes.js';
import funcionarioRoutes from './routes/funcionario.routes.js';
import escolaRoutes from './routes/escola.routes.js';

const app = express();

// Configuração de CORS mais específica
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://eduon-site.netlify.app', 'https://projetoeduon.netlify.app'],
  credentials: true
}));

app.use(json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API EDUON funcionando! 🚀', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      alunos: '/api/alunos',
      funcionarios: '/api/funcionarios',
      escola: '/api/escola'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API EDUON online 🚀', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/escola', escolaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API EDUON rodando na porta ${PORT}`));
