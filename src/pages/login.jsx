import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("paciente"); // 'paciente' | 'profissional'
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const mostrarAlerta = (mensagem, sucesso) => {
    setAlerta({ mensagem, sucesso });
    setTimeout(() => setAlerta(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !senha) {
      mostrarAlerta("Por favor, preencha todos os campos", false);
      return;
    }

    setCarregando(true);

    try {
      const resultado = await authService.login({
        email,
        senha
      });

      if (resultado.token && resultado.user) {
        // Salva token e dados do usuário
        localStorage.setItem('token', resultado.token);
        localStorage.setItem('user', JSON.stringify(resultado.user));
        
        mostrarAlerta("Login realizado com sucesso!", true);
        
        // Redireciona baseado no tipo de usuário
        setTimeout(() => {
          if (resultado.user.tipo === 'paciente') {
            window.location.href = '/home';
          } else {
            window.location.href = '/profissional';
          }
        }, 1000);
      } else {
        mostrarAlerta(resultado.error || "Erro no login", false);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      mostrarAlerta("Erro de conexão. Tente novamente.", false);
    } finally {
      setCarregando(false);
    }
  };

  const TipoUsuarioBotao = ({ tipo, label }) => {
    const selecionado = tipoUsuario === tipo;
    return (
      <button
        type="button"
        onClick={() => setTipoUsuario(tipo)}
        className={`w-1/2 py-3 rounded-full font-ubuntu text-sm md:text-base transition-all ${
          selecionado 
            ? "bg-[#9B7BFF] text-white shadow-lg" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Alerta */}
      {alerta && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              alerta.sucesso ? "bg-green-500" : "bg-red-500"
            } text-white font-ubuntu flex items-center gap-2`}
          >
            {alerta.sucesso ? "✅" : "❌"} {alerta.mensagem}
          </div>
        </div>
      )}

      {/* Lado Esquerdo - Branding */}
      <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#9B7BFF] to-[#7E5BFF] text-white p-8">
        <div className="text-center">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
            <span className="text-[#9B7BFF] text-4xl font-bold">🧬</span>
          </div>
          <h1 className="text-5xl font-bold font-ubuntu mb-4">GenoWeb</h1>
          <p className="text-xl opacity-90">Sistema de Análise Genética Familiar</p>
          <p className="mt-4 opacity-75">Gerencie históricos genéticos da sua família de forma segura e intuitiva</p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header do Form */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-ubuntu text-gray-800 mb-2">
                Bem-vindo de volta!
              </h2>
              <p className="text-gray-600">Entre na sua conta</p>
            </div>

            {/* Seletor de Tipo de Usuário */}
            <div className="bg-gray-100 rounded-full p-1 flex mb-6">
              <TipoUsuarioBotao tipo="paciente" label="Paciente" />
              <TipoUsuarioBotao tipo="profissional" label="Profissional" />
            </div>

            {/* Formulário */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                  required
                />
              </div>

              {/* Campo Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={senhaVisivel ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Link de recuperação de senha */}
              <div className="text-right">
                <a href="/recuperar-senha" className="text-sm text-[#9B7BFF] hover:underline">
                  Esqueceu sua senha?
                </a>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#9B7BFF] text-white py-3 rounded-xl font-medium hover:bg-[#8B6BFF] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              {/* Link para cadastro */}
              <div className="text-center">
                <p className="text-gray-600">
                  Não tem uma conta?{" "}
                  <a href="/cadastro" className="text-[#9B7BFF] hover:underline font-medium">
                    Cadastre-se
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap');
        
        .font-ubuntu {
          font-family: 'Ubuntu', sans-serif;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}