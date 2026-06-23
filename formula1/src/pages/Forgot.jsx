// src/pages/Forgot.jsx
import { Helmet } from 'react-helmet-async';
import ResetPassword from '../components/auth/ResetPassword.jsx';
import "../styles/Auth.css";
import "../styles/Page.css";

function Forgot() {
  return (
    <>
      <Helmet>
        <title>Redefinir Senha | Fórmula 1 Statistics</title>
        <meta name="description" content="Redefina sua senha de acesso ao Fórmula 1 Statistics. Insira seu e-mail para receber o link de recuperação." />
        <meta property="og:title" content="Redefinir Senha | Fórmula 1 Statistics" />
        <meta property="og:url" content="https://formula1-statistics.vercel.app/forgot" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="auth-page">
        <ResetPassword />
      </section>
    </>
  );
}

export default Forgot;