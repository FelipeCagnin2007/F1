import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Email from "../components/Email";
import Me from "../assets/profile.jpeg";
import { useAuth } from "../context/AuthContext";
import "../styles/Page.css";

function Contact() {
    const { currentUser } = useAuth();

    return (
        <>
            <Helmet>
                <title>Sobre Mim — Felipe Cagnin | Fórmula 1 Statistics</title>
                <meta name="description" content="Conheça Felipe Cagnin, desenvolvedor full-stack de 17 anos especializado em soluções digitais. Saiba mais sobre sua jornada na tecnologia e entre em contato." />
                <meta property="og:title" content="Sobre Mim — Felipe Cagnin | Fórmula 1 Statistics" />
                <meta property="og:description" content="Desenvolvedor full-stack apaixonado por tecnologia, música e F1. Conheça o criador do F1 Statistics." />
                <meta property="og:url" content="https://formula1-statistics.vercel.app/contact" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Person",
                    "name": "Felipe Cagnin",
                    "description": "Desenvolvedor full-stack de 17 anos, criador do portal Fórmula 1 Statistics.",
                    "url": "https://formula1-statistics.vercel.app/contact",
                    "sameAs": [
                        "https://github.com/Talion2007",
                        "https://www.linkedin.com/in/felipe-cagnin-94a367348/"
                    ],
                    "knowsAbout": ["React", "JavaScript", "Firebase", "Desenvolvimento Web", "Fórmula 1"]
                })}</script>
            </Helmet>

            <Header />

            <section className="Main">
                <div style={{ width: "100%", maxWidth: "var(--max-width)", padding: "var(--space-8) var(--space-6) 0" }}>
                    <h1 className="page-title">Sobre Mim</h1>
                </div>

                <div className="profile">
                    <img src={Me} alt="Felipe Cagnin — Desenvolvedor Full-Stack" className="profile-image" />
                    <p>
                        Olá! Meu nome é <strong>Felipe Cagnin</strong>, tenho 17 anos e sou brasileiro, atualmente estudando Desenvolvimento de Sistemas no SENAI. Desde muito jovem, sou apaixonado por tecnologia e resolução de problemas, o que naturalmente me levou a seguir o caminho do desenvolvimento de software. Meu principal objetivo é me tornar um desenvolvedor full-stack capaz de construir soluções digitais eficientes, criativas e centradas no usuário.
                        <br /><br />
                        Para colocar minhas habilidades em prática, criei a <strong>Cagnin Software Development</strong> — minha marca pessoal e o ponto de partida da minha jornada na indústria de tecnologia. Por meio desta iniciativa, busco desenvolver projetos que reflitam minha dedicação a um código limpo, aprendizado contínuo e trabalho digital impactante.
                        <br /><br />
                        Fora do mundo da tecnologia, valorizo o conhecimento, a criatividade e a espiritualidade. Gosto de ler e jogar em meu tempo livre, e sou membro ativo da Congregação Cristã no Brasil. A música também é uma grande parte de quem eu sou — toco flauta, saxofone soprano e violão. Acredito que o crescimento vem da curiosidade, consistência e colaboração.
                    </p>
                </div>

                <div className="ContactUs">
                    <h2>Entre em Contato</h2>
                    {!currentUser ? (
                        <Email />
                    ) : (
                        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                            Você está logado. Para entrar em contato, envie um e-mail diretamente para{" "}
                            <a href="mailto:radiance.knight.2007@gmail.com">radiance.knight.2007@gmail.com</a>
                        </p>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
}

export default Contact;