// src/components/auth/ResetPassword.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('Verifique seu e-mail para o link de redefinição de senha.');
            setEmail('');
        } catch (err) {
            console.error("Erro ao redefinir a senha:", err.message);
            setError('Ocorreu um erro, tente novamente mais tarde!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="totalContainer Forgot">
            <h2>Redefinir Senha</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="resetEmail">E-mail</label>
                    <input
                        type="email"
                        id="resetEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="seu@email.com"
                        autoComplete="email"
                    />
                </div>

                {message && (
                    <p style={{
                        color: 'var(--color-success)',
                        background: 'var(--color-success-light)',
                        border: '1px solid rgba(45,157,94,0.2)',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)'
                    }}>
                        ✅ {message}
                    </p>
                )}

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
            </form>

            <div className="accountAlready Register">
                <h2>Lembrou sua senha?</h2>
                <button type="button" className="ButtonAccountConfig Register">
                    <Link to="/login">Voltar para o Login</Link>
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

export default ResetPassword;