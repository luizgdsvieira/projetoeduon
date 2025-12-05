import supabase from '../config/db.js';
import bcrypt from 'bcryptjs';

const { hash } = bcrypt;

// Gera um usuário de app para o funcionário recém-criado
async function createStaffUser(staff, fallbackSchoolId) {
  const schoolId = staff.school_id || fallbackSchoolId;
  const schoolSlug = (schoolId || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'eduon';
  const staffSlug = (staff.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'staff';

  const username = `${schoolSlug}-stf-${staffSlug}`;
  const password = Math.random().toString(36).slice(-8);
  const password_hash = await hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{
      school_id: schoolId,
      username,
      password_hash,
      role: 'staff',
      staff_id: staff.id
    }]);

  return { error, credentials: { username, password, role: 'staff' } };
}

export const getAll = async (req, res) => {
  try {
    // Parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Buscar total de registros para calcular total de páginas
    const { count, error: countError } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', req.user.school_id);

    if (countError) throw countError;

    // Buscar dados paginados
    const { data, error } = await supabase
      .from('staff')
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
    console.error('Erro ao buscar funcionários:', err);
    res.status(500).json({ error: 'Erro ao buscar funcionários', details: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', req.params.id)
      .eq('school_id', req.user.school_id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar funcionário:', err);
    res.status(500).json({ error: 'Erro ao buscar funcionário', details: err.message });
  }
};

export const create = async (req, res) => {
  try {
    console.log('📥 Dados recebidos para cadastro de funcionário:', req.body);
    console.log('👤 Usuário logado:', req.user);
    
    // Identificar a escola
    const schoolId = req.user?.school_id || req.body.school_id;
    if (!schoolId) {
      return res.status(400).json({
        error: 'School_id não encontrado',
        details: 'O usuário admin precisa estar vinculado a uma escola ou informar school_id'
      });
    }
    
    // Validar campos obrigatórios
    if (!req.body.name && !req.body.nome) {
      return res.status(400).json({ 
        error: 'Nome é obrigatório',
        details: 'O campo name ou nome deve ser fornecido'
      });
    }
    
    // Preparar dados do funcionário
    const funcionario = { 
      name: req.body.name || req.body.nome,
      cargo: req.body.cargo || null,
      nascimento: req.body.nascimento || null,
      school_id: schoolId 
    };
    
    // Remover campos undefined ou vazios (exceto school_id que é obrigatório)
    Object.keys(funcionario).forEach(key => {
      if (key !== 'school_id' && (funcionario[key] === undefined || funcionario[key] === '' || funcionario[key] === null)) {
        delete funcionario[key];
      }
    });
    
    console.log('📝 Dados do funcionário a serem inseridos:', funcionario);
    
    const { data, error } = await supabase
      .from('staff')
      .insert([funcionario])
      .select();
    
    if (error) {
      console.error('❌ Erro do Supabase:', error);
      return res.status(400).json({ 
        error: 'Erro ao cadastrar funcionário', 
        details: error.message,
        code: error.code
      });
    }
    
    console.log('✅ Funcionário cadastrado com sucesso:', data);
    
    // Verificar se data existe e tem elementos
    if (!data || data.length === 0) {
      console.warn('⚠️ Supabase retornou array vazio, mas o insert pode ter funcionado');
      // Buscar o funcionário recém-criado como fallback
      const { data: funcionarioCriado } = await supabase
        .from('staff')
        .select('*')
        .eq('school_id', req.user.school_id)
        .eq('name', funcionario.name)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (funcionarioCriado) {
        return res.status(201).json(funcionarioCriado);
      }
      
      return res.status(201).json({ 
        message: 'Funcionário cadastrado com sucesso',
        name: funcionario.name,
        school_id: funcionario.school_id,
        warning: 'Não foi possível recuperar o funcionário criado automaticamente'
      });
    }

    let funcionarioData = data[0];

    // Objeto para armazenar resultados da geração
    const geracaoResult = {
      login: { sucesso: false, erro: null, credenciais: null }
    };

    // Gerar login para o app do funcionário (não bloqueia cadastro se falhar)
    try {
      console.log('🔐 Criando credenciais de login para o funcionário...');
      const { error: userError, credentials: generatedCredentials } = await createStaffUser(funcionarioData, schoolId);
      
      if (userError) {
        console.warn('⚠️ Erro ao criar usuário para funcionário:', userError);
        geracaoResult.login.erro = userError.message || 'Erro desconhecido ao criar usuário';
      } else {
        console.log('✅ Credenciais de login criadas com sucesso');
        geracaoResult.login.sucesso = true;
        geracaoResult.login.credenciais = generatedCredentials;
      }
    } catch (credErr) {
      console.error('⚠️ Erro inesperado ao gerar credenciais do funcionário:', credErr);
      geracaoResult.login.erro = credErr.message || 'Erro inesperado ao criar credenciais';
    }

    // Preparar resposta
    const resposta = {
      message: 'Funcionário cadastrado com sucesso!',
      funcionario: funcionarioData,
      geracao: {
        login: geracaoResult.login.sucesso ? 'Criado com sucesso' : `Erro: ${geracaoResult.login.erro || 'Desconhecido'}`
      }
    };
    
    // Adicionar credenciais se foram geradas
    if (geracaoResult.login.credenciais) {
      resposta.credenciais = geracaoResult.login.credenciais;
    }
    
    console.log('✅ Processo de cadastro concluído:', {
      funcionario: funcionarioData.name,
      login: geracaoResult.login.sucesso ? '✅' : '❌'
    });
    
    res.status(201).json(resposta);
  } catch (err) {
    console.error('🔥 Erro no controller:', err);
    res.status(500).json({ 
      error: 'Erro ao cadastrar funcionário', 
      details: err.message 
    });
  }
};

export const deleteFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do funcionário é obrigatório' });
    }

    // Verificar se o funcionário existe e pertence à escola do usuário
    const { data: funcionario, error: funcionarioError } = await supabase
      .from('staff')
      .select('id, name, school_id')
      .eq('id', id)
      .eq('school_id', req.user.school_id)
      .single();

    if (funcionarioError || !funcionario) {
      return res.status(404).json({ 
        error: 'Funcionário não encontrado',
        details: 'O funcionário não existe ou não pertence à sua escola'
      });
    }

    // Deletar usuário associado (se existir)
    try {
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('staff_id', id);
      
      if (userError && userError.code !== 'PGRST116') {
        console.warn('⚠️ Aviso ao deletar usuário associado:', userError.message);
      }
    } catch (userErr) {
      console.warn('⚠️ Erro ao deletar usuário associado (não bloqueia exclusão):', userErr);
    }

    // Deletar o funcionário
    const { error: deleteError } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)
      .eq('school_id', req.user.school_id);

    if (deleteError) {
      console.error('❌ Erro ao deletar funcionário:', deleteError);
      return res.status(500).json({ 
        error: 'Erro ao deletar funcionário', 
        details: deleteError.message 
      });
    }

    console.log(`✅ Funcionário ${funcionario.name} (ID: ${id}) deletado com sucesso`);
    
    res.json({ 
      message: 'Funcionário deletado com sucesso',
      funcionario: {
        id: funcionario.id,
        name: funcionario.name
      }
    });
  } catch (err) {
    console.error('🔥 Erro no controller de exclusão:', err);
    res.status(500).json({ 
      error: 'Erro ao deletar funcionário', 
      details: err.message 
    });
  }
};