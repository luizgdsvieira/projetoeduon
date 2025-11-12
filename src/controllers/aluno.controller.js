import supabase from '../config/db.js';
import bcrypt from 'bcrypt';
import qrUtils from '../utils/qrcode.js';

export async function getAll(req, res) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', req.user.school_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({ error: 'Erro ao buscar alunos', details: err.message });
  }
}

export async function getById(req, res) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar aluno:', err);
    res.status(500).json({ error: 'Erro ao buscar aluno', details: err.message });
  }
}

export async function create(req, res) {
  try {
    console.log('📥 Dados recebidos para cadastro:', req.body);
    console.log('👤 Usuário logado:', req.user);

    if (!req.body.name && !req.body.nome) {
      return res.status(400).json({
        error: 'Nome é obrigatório',
        details: 'O campo name ou nome deve ser fornecido'
      });
    }

    const aluno = {
      name: req.body.name || req.body.nome,
      matricula: req.body.matricula,
      ano: req.body.ano,
      turma: req.body.turma,
      turno: req.body.turno,
      nascimento: req.body.nascimento,
      school_id: req.user.school_id
    };

    // 1️⃣ Inserir aluno
    const { data: alunoData, error } = await supabase
      .from('students')
      .insert([aluno])
      .select()
      .single();

    if (error) throw error;

    // 2️⃣ Gerar QR Code e token
    const { token, qrImage } = await qrUtils.generateStudentQr(alunoData);

    // 3️⃣ Atualizar aluno com o token
    const { error: updateError } = await supabase
      .from('students')
      .update({ qrcode_token: token })
      .eq('id', alunoData.id);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar QR Code token:', updateError);
      // Não falha o cadastro se o update do token falhar, mas loga o erro
    }

    // 4️⃣ Criar usuário de login para o aluno
    const username = alunoData.matricula || alunoData.name.toLowerCase().replace(/\s+/g, '');
    const defaultPassword = alunoData.matricula || alunoData.name.toLowerCase().replace(/\s+/g, '');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { error: userError } = await supabase
      .from('users')
      .insert([{
        school_id: alunoData.school_id,
        username: username,
        password_hash: hashedPassword,
        role: 'student',
        student_id: alunoData.id
      }]);

    if (userError) {
      console.error('⚠️ Erro ao criar usuário de login:', userError);
      // Se o usuário já existe, não falha o cadastro
      if (userError.code !== '23505') { // 23505 é código de violação de constraint única no PostgreSQL
        throw new Error(`Erro ao criar usuário de login: ${userError.message}`);
      }
    }

    console.log('✅ Aluno cadastrado com QR e login:', alunoData.name);
    console.log('📋 Credenciais de login:', { username, password: defaultPassword });

    res.status(201).json({
      message: 'Aluno cadastrado com sucesso!',
      aluno: { 
        ...alunoData, 
        qrcode_token: token, 
        qrImage 
      },
      credenciais: {
        username: username,
        password: defaultPassword,
        role: 'student'
      }
    });
  } catch (err) {
    console.error('🔥 Erro ao cadastrar aluno:', err);
    res.status(500).json({
      error: 'Erro ao cadastrar aluno',
      details: err.message
    });
  }
}

export async function verifyQrCode(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token do QR Code é obrigatório.' });
    }

    // 🔍 1️⃣ Verifica o token JWT
    const decoded = qrUtils.verifyStudentQrToken(token);

    if (!decoded || !decoded.student_id) {
      return res.status(401).json({ error: 'QR Code inválido ou expirado.' });
    }

    // 🔎 2️⃣ Busca o aluno correspondente
    const { data: aluno, error } = await supabase
      .from('students')
      .select('id, name, matricula, ano, turma, turno, nascimento, school_id, created_at')
      .eq('id', decoded.student_id)
      .eq('school_id', decoded.school_id)
      .single();

    if (error || !aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    // ✅ 3️⃣ Retorna a carteirinha digital
    return res.json({
      valid: true,
      aluno: {
        nome: aluno.name,
        matricula: aluno.matricula,
        ano: aluno.ano,
        turma: aluno.turma,
        turno: aluno.turno,
        nascimento: aluno.nascimento,
        escola_id: aluno.school_id,
        criado_em: aluno.created_at
      }
    });

  } catch (err) {
    console.error('❌ Erro ao verificar QR Code:', err);
    res.status(500).json({ error: 'Erro ao verificar QR Code', details: err.message });
  }
}




/*
import supabase from '../config/db.js';

export async function getAll(req, res) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', req.user.school_id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({ error: 'Erro ao buscar alunos', details: err.message });
  }
}

export async function getById(req, res) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar aluno:', err);
    res.status(500).json({ error: 'Erro ao buscar aluno', details: err.message });
  }
}

export async function create(req, res) {
  try {
    console.log('📥 Dados recebidos para cadastro:', req.body);
    console.log('👤 Usuário logado:', req.user);
    
    // Validar campos obrigatórios
    if (!req.body.name && !req.body.nome) {
      return res.status(400).json({ 
        error: 'Nome é obrigatório',
        details: 'O campo name ou nome deve ser fornecido'
      });
    }
    
    // Preparar dados do aluno - limpar campos vazios e garantir nome correto
    const aluno = { 
      name: req.body.name || req.body.nome, // Aceita ambos os formatos
      matricula: req.body.matricula || null,
      ano: req.body.ano || null,
      turma: req.body.turma || null,
      turno: req.body.turno || null,
      nascimento: req.body.nascimento || null,
      school_id: req.user.school_id 
    };
    
    // Remover campos undefined ou vazios (exceto school_id que é obrigatório)
    Object.keys(aluno).forEach(key => {
      if (key !== 'school_id' && (aluno[key] === undefined || aluno[key] === '' || aluno[key] === null)) {
        delete aluno[key];
      }
    });
    
    console.log('📝 Dados do aluno a serem inseridos:', aluno);
    
    const { data, error } = await supabase
      .from('students')
      .insert([aluno])
      .select();
    
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      console.error('📋 Código do erro:', error.code);
      console.error('📋 Mensagem:', error.message);
      console.error('📋 Detalhes:', error.details);
      console.error('📋 Hint:', error.hint);
      return res.status(400).json({ 
        error: 'Erro ao cadastrar aluno', 
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }
    
    console.log('✅ Aluno cadastrado com sucesso:', data);
    
    // Verificar se data existe e tem elementos
    if (!data || data.length === 0) {
      console.warn('⚠️ Supabase retornou array vazio, mas o insert pode ter funcionado');
      // Buscar o aluno recém-criado como fallback
      const { data: alunoCriado } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', req.user.school_id)
        .eq('name', aluno.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (alunoCriado) {
        return res.status(201).json(alunoCriado);
      }
      
      return res.status(201).json({ 
        message: 'Aluno cadastrado com sucesso',
        name: aluno.name,
        school_id: aluno.school_id
      });
    }
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('🔥 Erro no controller:', err);
    res.status(500).json({ 
      error: 'Erro ao cadastrar aluno', 
      details: err.message 
    });
  }
}
*/