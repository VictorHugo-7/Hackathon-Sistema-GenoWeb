import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    sexo: '',
    data_nascimento: '',
    tipo: 'paciente' // 'paciente' ou 'profissional'
  });
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // refs GSAP
  const scope = useRef(null);
  const leftRef = useRef(null);
  const cardRef = useRef(null);
  const fieldsRef = useRef(null);
  const submitBtnRef = useRef(null);

  const mostrarAlerta = (mensagem, sucesso) => {
    setAlerta({ mensagem, sucesso });
    setTimeout(() => setAlerta(null), 3000);
  };

  const validarSenha = (senha) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(senha);
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarDataNascimento = (data) => {
    if (!data) return false;
    
    const dataNasc = new Date(data);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNasc.getFullYear();
    
    return dataNasc instanceof Date && !isNaN(dataNasc) && idade >= 1 && idade <= 120;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { nome, email, senha, confirmarSenha, sexo, data_nascimento, tipo } = formData;

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      mostrarAlerta('Preencha todos os campos!', false);
      return;
    }

    if (tipo === 'paciente' && (!sexo || !data_nascimento)) {
      mostrarAlerta('Selecione o sexo e preencha a data de nascimento!', false);
      return;
    }

    if (!validarEmail(email)) {
      mostrarAlerta('Por favor, insira um email válido!', false);
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarAlerta("As senhas não coincidem!", false);
      return;
    }

    if (tipo === 'paciente' && !validarDataNascimento(data_nascimento)) {
      mostrarAlerta('Data de nascimento inválida. A pessoa deve ter entre 1 e 120 anos.', false);
      return;
    }

    setCarregando(true);

    try {
      const resp = await fetch("http://localhost:5000/api/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, dataNasc, sexo, email, senha }),
      });
      
      if (tipo === 'paciente') {
        resultado = await authService.cadastrarPaciente({
          nome,
          email,
          senha,
          sexo,
          data_nascimento
        });
      } else {
        resultado = await authService.cadastrarProfissional({
          nome,
          email,
          senha
        });
      }

      if (resultado.token) {
        // Salva token e redireciona
        localStorage.setItem('token', resultado.token);
        localStorage.setItem('user', JSON.stringify(resultado.user));
        
        mostrarAlerta('Cadastro realizado com sucesso!', true);
        
        setTimeout(() => {
          window.location.href = tipo === 'paciente' ? '/home' : '/profissional';
        }, 1500);
      } else {
        mostrarAlerta("Erro no cadastro. Verifique os dados.", false);
      }
    } catch {
      mostrarAlerta("Erro na requisição. Tente novamente mais tarde.", false);
    } finally {
      setCarregando(false);
    }
  };

  // animações
  useGSAP(
    () => {
      gsap.from(leftRef.current, { 
        x: "-8%", 
        opacity: 0, 
        duration: 0.8, 
        ease: "power3.out" 
      });
      
      gsap.from(cardRef.current, { 
        y: 28, 
        opacity: 0, 
        duration: 0.8, 
        ease: "power3.out", 
        delay: 0.1 
      });
      
      const items = fieldsRef.current
        ? Array.from(fieldsRef.current.querySelectorAll("[data-field]"))
        : [];
      gsap.from(items, {
        y: 16,
        opacity: 0,
        stagger: 0.07,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.2,
      });

      const onEnter = () => gsap.to(submitBtnRef.current, { 
        scale: 1.02, 
        duration: 0.15 
      });
      const onLeave = () => gsap.to(submitBtnRef.current, { 
        scale: 1, 
        duration: 0.15 
      });
      submitBtnRef.current?.addEventListener("mouseenter", onEnter);
      submitBtnRef.current?.addEventListener("mouseleave", onLeave);
      return () => {
        submitBtnRef.current?.removeEventListener("mouseenter", onEnter);
        submitBtnRef.current?.removeEventListener("mouseleave", onLeave);
      };
    },
    { scope }
  );

  // Calcular idade máxima e mínima para o date picker
  const hoje = new Date();
  const dataMinima = new Date(hoje.getFullYear() - 120, hoje.getMonth(), hoje.getDate());
  const dataMaxima = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());

  return (
    <div ref={scope} className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-blue-50 to-purple-50">
      {/* ALERTA */}
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

      {/* ESQUERDA - Layout do Login (Gradiente Roxo) */}
      <div 
        ref={leftRef}
        className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-[#9B7BFF] to-[#7E5BFF] text-white p-8"
      >
        <div className="text-center">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl">
            <span className="text-[#9B7BFF] text-4xl font-bold">🧬</span>
          </div>
          <h1 className="text-5xl font-bold font-ubuntu mb-4">GenoWeb</h1>
          <p className="text-xl opacity-90">Sistema de Análise Genética Familiar</p>
          <p className="mt-4 opacity-75">Gerencie históricos genéticos da sua família de forma segura e intuitiva</p>
        </div>
      </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Seu nome completo"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                required
              />
            </div>

            {/* Data de Nascimento (apenas para pacientes) */}
            {formData.tipo === 'paciente' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleChange('data_nascimento', e.target.value)}
                  min={dataMinima.toISOString().split('T')[0]}
                  max={dataMaxima.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Data de nascimento é obrigatória para pacientes
                </p>
              </div>
            )}

            {/* Sexo (apenas para pacientes) */}
            {formData.tipo === 'paciente' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexo *
                </label>
                <select
                  value={formData.sexo}
                  onChange={(e) => handleChange('sexo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            )}

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={senhaVisivel ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => handleChange('senha', e.target.value)}
                  placeholder="Crie uma senha forte"
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
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 8 caracteres, 1 maiúscula, 1 número e 1 símbolo
              </p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha *
              </label>
              <input
                type={senhaVisivel ? "text" : "password"}
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                placeholder="Repita sua senha"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                required
              />
            </div>

                {/* Senha */}
                <div data-field>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={senhaVisivel ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Crie uma senha"
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

                {/* Confirmar senha */}
                <div data-field>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar senha
                  </label>
                  <input
                    type={senhaVisivel ? "text" : "password"}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Botão Cadastrar */}
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={carregando}
                className="w-full bg-[#9B7BFF] text-white py-3 rounded-xl font-medium hover:bg-[#8B6BFF] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl mt-6"
              >
                {carregando ? "Cadastrando..." : "Cadastrar"}
              </button>

              {/* Link para login */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Já tem uma conta?{" "}
                  <a href="/login" className="text-[#9B7BFF] hover:underline font-medium">
                    Faça login
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Estilos */}
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