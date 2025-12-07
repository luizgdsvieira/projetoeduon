import supabase from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { sign } = jwt;
const { compare } = bcrypt;

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    console.log("📥 Login recebido:", { username, password: password ? '***' : undefined });

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password são obrigatórios' });
    }

    // Busca o usuário no Supabase com melhor tratamento de erro
    console.log("🔍 Buscando usuário no Supabase...");
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error("❌ Erro na consulta Supabase:", error);
      console.error("📋 Tipo do erro:", error.constructor?.name || typeof error);
      console.error("📋 Detalhes:", JSON.stringify(error, null, 2));
      
      // Se for erro de rede/conectividade, fornece mensagem mais específica
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
        return res.status(503).json({ 
          error: 'Serviço temporariamente indisponível', 
          details: 'Erro de conexão com o banco de dados. Tente novamente em alguns instantes.' 
        });
      }
      
      throw error;
    }

    const user = users?.[0];
    if (!user) {
      console.warn("⚠️ Usuário não encontrado:", username);
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    console.log("👤 Usuário encontrado:", { id: user.id, username: user.username, role: user.role, student_id: user.student_id });

    // Valida a senha
    if (!user.password_hash) {
      console.error("❌ Usuário sem hash de senha:", username);
      return res.status(500).json({ error: 'Erro na configuração do usuário' });
    }

    const match = await compare(password, user.password_hash);
    console.log("🔐 Comparação de senha:", match ? "✅ Match" : "❌ Não match");

    if (!match) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    // Gera o JWT
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET não está definido");
      return res.status(500).json({ error: 'Erro de configuração do servidor' });
    }

    // Preparar payload do JWT - incluir student_id se for aluno
    const jwtPayload = {
      id: user.id,
      role: user.role,
      school_id: user.school_id
    };

    // Se for aluno, incluir student_id no token
    if (user.role === 'student' && user.student_id) {
      jwtPayload.student_id = user.student_id;
      console.log("📚 Aluno detectado, incluindo student_id no token:", user.student_id);
    }

    const token = sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log("✅ Login bem-sucedido para:", username);

    // Garantir headers CORS
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("🔥 Erro no login:", err);
    console.error("📋 Tipo do erro:", err.constructor?.name || typeof err);
    console.error("📋 Mensagem:", err.message);
    if (err.stack) {
      console.error("📋 Stack:", err.stack);
    }
    if (err.cause) {
      console.error("📋 Causa:", err.cause);
    }
    
    // Mensagem de erro mais segura para produção
    const errorMessage = err.message || 'Erro desconhecido';
    res.status(500).json({ 
      error: 'Erro no login', 
      details: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : errorMessage
    });
  }
}


/*
import supabase from '../config/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { sign } = jwt;
const { compare } = bcrypt;

export async function login(req, res) {
  try {
    const { username, password, school } = req.body;

    const { data: users, error } = await supabase.from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error) throw error;

    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const match = await compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Senha inválida' });

    const token = sign(
      { id: user.id, role: user.role, school_id: user.school_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
}
*/