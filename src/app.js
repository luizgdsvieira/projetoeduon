import express, { json } from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.routes';
import alunoRoutes from './routes/aluno.routes';
import funcionarioRoutes from './routes/funcionario.routes';
import escolaRoutes from './routes/escola.routes';

const app = express();
app.use(cors());
app.use(json());

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/escola', escolaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API EDUON rodando na porta ${PORT}`));
