import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
import alunoRoutes from './routes/aluno.routes.js';
import funcionarioRoutes from './routes/funcionario.routes.js';
import escolaRoutes from './routes/escola.routes.js';

const app = express();

// Configuração de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Vite dev server alternativo
      'http://localhost:5174', // Vite dev server alternativo 2
      'https://eduonweb.netlify.app', // Netlify
      'https://eduonweb.netlify.app/', // Netlify com barra
    ];
    
    // Em desenvolvimento, aceitar qualquer origem localhost
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('⚠️ Origem não permitida:', origin);
      callback(null, true); // Temporariamente permitir todas para debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});
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
