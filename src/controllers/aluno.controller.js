import supabase from '../config/db.js';
import bcrypt from 'bcrypt';
import qrUtils from '../utils/qrcode.js';

export async function getAll(req, res) {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Buscar total de registros para calcular total de páginas
    const { count, error: countError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', req.user.school_id);

    if (countError) throw countError;

    // Buscar dados paginados
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', req.user.school_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / limit);

    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
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
      matricula: req.body.matricula || null,
      ano: req.body.ano || null,
      turma: req.body.turma || null,
      turno: req.body.turno || null,
      nascimento: req.body.nascimento || null,
      school_id: req.user.school_id 
    };
    
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
      return res.status(400).json({ 
        error: 'Erro ao cadastrar aluno', 
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }
    
    console.log('✅ Aluno cadastrado com sucesso:', data);
    
    // Obter o aluno criado (pode vir do data ou precisar buscar)
    let alunoData = data && data.length > 0 ? data[0] : null;
    
    if (!alunoData) {
      console.warn('⚠️ Supabase retornou array vazio, buscando aluno recém-criado');
      const { data: alunoCriado, error: buscaError } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', req.user.school_id)
        .eq('name', aluno.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (buscaError || !alunoCriado) {
        console.error('❌ Erro ao buscar aluno recém-criado:', buscaError);
        return res.status(201).json({ 
          message: 'Aluno cadastrado com sucesso',
          name: aluno.name,
          school_id: aluno.school_id,
          warning: 'Não foi possível gerar QR Code e login automaticamente'
        });
      }
      
      alunoData = alunoCriado;
    }
    
    // Objeto para armazenar resultados da geração
    const geracaoResult = {
      qrCode: { sucesso: false, erro: null },
      login: { sucesso: false, erro: null, credenciais: null }
    };
    
    // 1️⃣ Gerar QR Code (não bloqueia o cadastro se falhar)
    try {
      console.log('📱 Gerando QR Code para o aluno...');
      const { token, qrImage } = await qrUtils.generateStudentQr(alunoData);
      
      // Atualizar aluno com o token do QR Code
      const { error: updateError } = await supabase
        .from('students')
        .update({ qrcode_token: token })
        .eq('id', alunoData.id);
      
      if (updateError) {
        console.error('⚠️ Erro ao salvar token do QR Code:', updateError);
        geracaoResult.qrCode.erro = updateError.message;
      } else {
        console.log('✅ QR Code gerado e salvo com sucesso');
        geracaoResult.qrCode.sucesso = true;
        alunoData.qrcode_token = token;
        alunoData.qrImage = qrImage;
      }
    } catch (qrError) {
      console.error('⚠️ Erro ao gerar QR Code (não bloqueia cadastro):', qrError);
      geracaoResult.qrCode.erro = qrError.message;
    }
    
    // 2️⃣ Criar usuário de login (não bloqueia o cadastro se falhar)
    try {
      console.log('🔐 Criando credenciais de login para o aluno...');
      
      // Gerar username (prioriza matrícula, senão usa nome formatado)
      let username = alunoData.matricula 
        ? alunoData.matricula.trim()
        : alunoData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      
      if (!username || username.length < 3) {
        throw new Error('Não foi possível gerar um username válido (matrícula ou nome muito curto)');
      }
      
      // Verificar se o username já existe
      const { data: usuarioExistente } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .limit(1);
      
      if (usuarioExistente && usuarioExistente.length > 0) {
        console.warn(`⚠️ Username "${username}" já existe, tentando adicionar sufixo...`);
        // Tentar com sufixo numérico
        const usernameUnico = `${username}${alunoData.id.toString().slice(-4)}`;
        const { data: usuarioExistente2 } = await supabase
          .from('users')
          .select('id')
          .eq('username', usernameUnico)
          .limit(1);
        
        if (!usuarioExistente2 || usuarioExistente2.length === 0) {
          username = usernameUnico;
        } else {
          throw new Error(`Username "${username}" e variações já existem`);
        }
      }
      
      // Gerar senha padrão (matrícula ou nome formatado)
      const senhaPadrao = alunoData.matricula 
        ? alunoData.matricula.trim()
        : alunoData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').slice(0, 8);
      
      if (!senhaPadrao || senhaPadrao.length < 3) {
        throw new Error('Não foi possível gerar uma senha padrão válida');
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(senhaPadrao, 10);
      
      // Criar usuário
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
        // Se for erro de constraint única, não é crítico
        if (userError.code === '23505') {
          console.warn('⚠️ Usuário de login já existe para este aluno');
          geracaoResult.login.erro = 'Usuário de login já existe';
        } else {
          throw userError;
        }
      } else {
        console.log('✅ Credenciais de login criadas com sucesso');
        geracaoResult.login.sucesso = true;
        geracaoResult.login.credenciais = {
          username: username,
          password: senhaPadrao,
          role: 'student'
        };
      }
    } catch (loginError) {
      console.error('⚠️ Erro ao criar login (não bloqueia cadastro):', loginError);
      geracaoResult.login.erro = loginError.message;
    }
    
    // Preparar resposta
    const resposta = {
      message: 'Aluno cadastrado com sucesso!',
      aluno: alunoData,
      geracao: {
        qrCode: geracaoResult.qrCode.sucesso ? 'Gerado com sucesso' : `Erro: ${geracaoResult.qrCode.erro || 'Desconhecido'}`,
        login: geracaoResult.login.sucesso ? 'Criado com sucesso' : `Erro: ${geracaoResult.login.erro || 'Desconhecido'}`
      }
    };
    
    // Adicionar credenciais se foram geradas
    if (geracaoResult.login.credenciais) {
      resposta.credenciais = geracaoResult.login.credenciais;
    }
    
    // Adicionar QR Image se foi gerado
    if (alunoData.qrImage) {
      resposta.qrImage = alunoData.qrImage;
    }
    
    console.log('✅ Processo de cadastro concluído:', {
      aluno: alunoData.name,
      qrCode: geracaoResult.qrCode.sucesso ? '✅' : '❌',
      login: geracaoResult.login.sucesso ? '✅' : '❌'
    });
    
    res.status(201).json(resposta);
  } catch (err) {
    console.error('🔥 Erro no controller:', err);
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

export async function deleteAluno(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do aluno é obrigatório' });
    }

    // Verificar se o aluno existe e pertence à escola do usuário
    const { data: aluno, error: alunoError } = await supabase
      .from('students')
      .select('id, name, school_id')
      .eq('id', id)
      .eq('school_id', req.user.school_id)
      .single();

    if (alunoError || !aluno) {
      return res.status(404).json({ 
        error: 'Aluno não encontrado',
        details: 'O aluno não existe ou não pertence à sua escola'
      });
    }

    // Deletar usuário associado (se existir)
    try {
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('student_id', id);
      
      if (userError && userError.code !== 'PGRST116') {
        console.warn('⚠️ Aviso ao deletar usuário associado:', userError.message);
      }
    } catch (userErr) {
      console.warn('⚠️ Erro ao deletar usuário associado (não bloqueia exclusão):', userErr);
    }

    // Deletar o aluno
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('school_id', req.user.school_id);

    if (deleteError) {
      console.error('❌ Erro ao deletar aluno:', deleteError);
      return res.status(500).json({ 
        error: 'Erro ao deletar aluno', 
        details: deleteError.message 
      });
    }

    console.log(`✅ Aluno ${aluno.name} (ID: ${id}) deletado com sucesso`);
    
    res.json({ 
      message: 'Aluno deletado com sucesso',
      aluno: {
        id: aluno.id,
        name: aluno.name
      }
    });
  } catch (err) {
    console.error('🔥 Erro no controller de exclusão:', err);
    res.status(500).json({ 
      error: 'Erro ao deletar aluno', 
      details: err.message 
    });
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