const API_BASE_URL = 'http://localhost:3000';

// Função para obter o token do localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Headers padrão para requisições autenticadas
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Serviço de autenticação
export const authService = {
  // Cadastro de paciente
  async cadastrarPaciente(dados) {
    const response = await fetch(`${API_BASE_URL}/auth/paciente/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
    return await response.json();
  },

  // Cadastro de profissional
  async cadastrarProfissional(dados) {
    const response = await fetch(`${API_BASE_URL}/auth/profissional/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
    return await response.json();
  },

  // Login geral
  async login(dados) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });
    return await response.json();
  },

  // Verificar token
  async verificarToken() {
    const response = await fetch(`${API_BASE_URL}/auth/verificar`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },
};

// Serviço de perfil e família
export const profileService = {
  // Atualizar perfil
  async atualizarPerfil(dados) {
    const response = await fetch(`${API_BASE_URL}/api/perfil`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    return await response.json();
  },

  // Criar família
  async criarFamilia(nomeFamilia) {
    const response = await fetch(`${API_BASE_URL}/api/familia`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nome_familia: nomeFamilia }),
    });
    return await response.json();
  },

  // Adicionar membro à família
  async adicionarMembro(dadosMembro) {
    const response = await fetch(`${API_BASE_URL}/api/familia/membros`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(dadosMembro),
    });
    return await response.json();
  },

  // Obter dados da família
  async obterMinhaFamilia() {
    const response = await fetch(`${API_BASE_URL}/api/minha-familia`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  // Sair da família
  async sairDaFamilia() {
    const response = await fetch(`${API_BASE_URL}/api/familia/sair`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },
};

// Utilitário para verificar se o usuário está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Utilitário para fazer logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};