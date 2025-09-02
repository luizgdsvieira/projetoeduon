import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import alunoRoutes from './routes/aluno.routes.js';
import funcionarioRoutes from './routes/funcionario.routes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 1*60*1000, max: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/funcionarios', funcionarioRoutes);

app.get('/', (_,res)=>res.send('EDUON API OK'));

const port = Number(process.env.PORT || 3000);
app.listen(port, ()=>console.log(`Server on ${port}`));
s