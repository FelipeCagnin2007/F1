// src/components/auth/SignIn.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Erro ao fazer login:', err.message);
      switch (err.code) {
        case 'auth/invalid-email':       setError('E-mail inválido.'); break;
        case 'auth/user-not-found':      setError('Usuário não encontrado. Verifique o e-mail.'); break;
        case 'auth/wrong-password':      setError('Senha incorreta.'); break;
        case 'auth/invalid-credential': setError('Credenciais inválidas. Verifique seu e-mail e senha.'); break;
        default:                          setError('Ocorreu um erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="totalContainer signin">
      <h2>Entrar</h2>

      <form onSubmit={handleSignIn} noValidate>
        <div>
          <label htmlFor="loginEmail">E-mail</label>
          <input
            type="email"
            id="loginEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="loginPassword">Senha</label>
          <input
            type="password"
            id="loginPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <Link to="/forgot" className="back-home-link" style={{ color: 'var(--color-info)', alignSelf: 'flex-start', marginTop: '-8px' }}>
          Esqueceu sua senha?
        </Link>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="accountAlready">
        <h2>Não tem uma conta?</h2>
        <button className="ButtonAccountConfig Register">
          <Link to="/register">Criar conta</Link>
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
        <Link to="/" className="back-home-link">
          ← Voltar para Início
        </Link>
      </div>
    </div>
  );
}

export default SignIn;