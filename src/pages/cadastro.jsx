import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [sexo, setSexo] = useState(""); // "masculino" | "feminino"
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
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

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (!nome || !dataNasc || !sexo || !email || !senha || !confirmarSenha) {
      mostrarAlerta("Preencha todos os campos!", false);
      return;
    }

    // validação simples de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mostrarAlerta("Informe um email válido.", false);
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarAlerta("As senhas não coincidem!", false);
      return;
    }

    setCarregando(true);

    try {
      const resp = await fetch("http://localhost:5000/api/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, dataNasc, sexo, email, senha }),
      });
      
      if (resp.ok) {
        mostrarAlerta("Cadastro realizado com sucesso!", true);
        setTimeout(() => (window.location.href = "/login"), 1500);
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

      {/* DIREITA - Formulário de Cadastro */}
      <main className="flex items-center justify-center p-6">
        <div ref={cardRef} className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Header do Form */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-ubuntu text-gray-800 mb-2">
                Crie sua conta
              </h2>
              <p className="text-gray-600">Preencha seus dados abaixo</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleCadastro}>
              {/* fields container para stagger */}
              <div ref={fieldsRef} className="space-y-6">
                {/* Nome */}
                <div data-field>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Data de nascimento */}
                <div data-field>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    value={dataNasc}
                    onChange={(e) => setDataNasc(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7BFF] focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Sexo */}
                <div data-field>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexo
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexo"
                        value="masculino"
                        checked={sexo === "masculino"}
                        onChange={(e) => setSexo(e.target.value)}
                        className="accent-[#9B7BFF]"
                      />
                      <span className="font-ubuntu">Masculino</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sexo"
                        value="feminino"
                        checked={sexo === "feminino"}
                        onChange={(e) => setSexo(e.target.value)}
                        className="accent-[#9B7BFF]"
                      />
                      <span className="font-ubuntu">Feminino</span>
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div data-field>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@dominio.com"
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