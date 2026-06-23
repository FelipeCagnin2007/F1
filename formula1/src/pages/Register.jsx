import { Helmet } from 'react-helmet-async';
import SignUp from '../components/auth/SignUp.jsx';
import "../styles/Auth.css";
import "../styles/Page.css";

function Register() {
  return (
    <>
      <Helmet>
        <title>Criar Conta | Fórmula 1 Statistics</title>
        <meta name="description" content="Crie sua conta gratuita no Fórmula 1 Statistics para acessar resultados, estatísticas exclusivas e chat em tempo real. Registre-se agora!" />
        <meta property="og:title" content="Criar Conta | Fórmula 1 Statistics" />
        <meta property="og:url" content="https://formula1-statistics.vercel.app/register" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="auth-page">
        <SignUp />
      </section>
    </>
  );
}

export default Register;