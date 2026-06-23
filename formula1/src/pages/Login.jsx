import { Helmet } from 'react-helmet-async';
import SignIn from '../components/auth/SignIn.jsx';
import "../styles/Auth.css";
import "../styles/Page.css";

function Login() {
  return (
    <>
      <Helmet>
        <title>Login | Fórmula 1 Statistics</title>
        <meta name="description" content="Faça login no Fórmula 1 Statistics para acessar resultados, estatísticas exclusivas e chat em tempo real. Conecte-se com a comunidade de fãs da F1." />
        <meta property="og:title" content="Login | Fórmula 1 Statistics" />
        <meta property="og:url" content="https://formula1-statistics.vercel.app/login" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section className="auth-page">
        <SignIn />
      </section>
    </>
  );
}

export default Login;