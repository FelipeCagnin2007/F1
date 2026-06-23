import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import carrouselFront from "../assets/carrouselFront.jpg";
import carrouselOne from "../assets/carrouselOne.jpg";
import carrouselTwo from "../assets/carrouselTwo.jpg";
import carrouselTri from "../assets/carrouselTri.webp";
import "../styles/Page.css";

const CAROUSEL_IMAGES = [
    { src: carrouselFront, alt: "Carro de Fórmula 1 na pista de corrida" },
    { src: carrouselOne,   alt: "Paddock de Fórmula 1, boxes das equipes" },
    { src: carrouselTwo,   alt: "Piloto de Fórmula 1 celebrando vitória no pódio" },
    { src: carrouselTri,   alt: "Grid de largada da Fórmula 1 com carros em posição" },
];

function Home() {
    const [carousel, setCarousel] = useState(0);
    const [userName, setUserName] = useState("");
    const { currentUser, logout, deleteAccount } = useAuth();
    const navigate = useNavigate();

    // Carrossel automático
    useEffect(() => {
        const interval = setInterval(() => {
            setCarousel((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, 7500);
        return () => clearInterval(interval);
    }, []);

    // Nome do usuário
    useEffect(() => {
        setUserName(currentUser ? (currentUser.displayName || currentUser.email) : "");
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Erro ao fazer logout:", error.message);
        }
    };

    const handleAccountDeletion = async () => {
        if (!currentUser) return;
        const confirmDeletion = window.confirm(
            "Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
        );
        if (confirmDeletion) {
            try {
                await deleteAccount();
                navigate("/");
            } catch (error) {
                console.error("Erro ao excluir conta:", error.message);
                if (error.message.includes("re-authenticate")) {
                    navigate("/login");
                }
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>Início | Fórmula 1 Statistics</title>
                <meta name="description" content="Acompanhe notícias, resultados, estatísticas e muito mais sobre a Fórmula 1. Seu portal completo para fãs da F1!" />
                <meta property="og:title" content="Início | Fórmula 1 Statistics" />
                <meta property="og:description" content="Acompanhe notícias, resultados, estatísticas e muito mais sobre a Fórmula 1. Seu portal completo para fãs da F1!" />
                <meta property="og:url" content="https://formula1-statistics.vercel.app/" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Início — Fórmula 1 Statistics",
                    "description": "Portal completo de estatísticas da Fórmula 1 com resultados de corridas, perfis de pilotos e chat em tempo real.",
                    "url": "https://formula1-statistics.vercel.app/"
                })}</script>
            </Helmet>

            <Header />

            <section className="Main">
                {/* Carrossel */}
                <div className="carousel-wrapper">
                    <img
                        src={CAROUSEL_IMAGES[carousel].src}
                        alt={CAROUSEL_IMAGES[carousel].alt}
                        title="Imagens dinâmicas do universo da Fórmula 1"
                        loading="eager"
                    />
                    <div className="carousel-overlay" aria-hidden="true" />
                    {/* Dots de navegação */}
                    <div className="carousel-dots" role="tablist" aria-label="Slides do carrossel">
                        {CAROUSEL_IMAGES.map((_, idx) => (
                            <button
                                key={idx}
                                className={`carousel-dot ${carousel === idx ? "active" : ""}`}
                                onClick={() => setCarousel(idx)}
                                role="tab"
                                aria-selected={carousel === idx}
                                aria-label={`Ir para slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="home-content">
                    <h1 className="page-title">
                        Formula 1 Statistics: <span>Seu Portal Completo</span>
                    </h1>

                    <div className="content-body">
                        <p>
                            A Fórmula 1 (F1) é o ápice da velocidade, precisão e estratégia, onde os melhores pilotos, engenheiros e equipes do mundo se reúnem para competir no mais alto nível do automobilismo. Com uma história de mais de 70 anos, a F1 evoluiu para um espetáculo global assistido por milhões em todo o mundo, cativando o público com sua velocidade impressionante, tecnologia de ponta e rivalidades intensas.
                        </p>
                        <p>
                            As corridas acontecem em uma ampla variedade de pistas, cada uma oferecendo desafios únicos para pilotos e equipes. Dos circuitos históricos como Mônaco, Silverstone e Spa-Francorchamps, a adições mais recentes como Baku e as Américas, a Fórmula 1 oferece uma combinação de ruas estreitas e sinuosas e circuitos de alta velocidade.
                        </p>
                        <p>
                            Os carros de Fórmula 1 são maravilhas tecnológicas, construídos para ultrapassar os limites da engenharia. Alimentados por unidades de potência híbridas que combinam motores de combustão interna e sistemas de recuperação de energia, esses veículos produzem mais de 1.000 cavalos de potência e podem atingir velocidades superiores a 370 km/h.
                        </p>
                        <p>
                            Na F1, os pilotos são considerados os maiores atletas do automobilismo, com reflexos excepcionais e a capacidade de tomar decisões em frações de segundo. Eles suportam forças de até 5G durante curvas e frenagens em alta velocidade, semelhante às que pilotos de caça experimentam.
                        </p>
                        <p>
                            O esporte é conhecido por suas incríveis rivalidades: Senna vs. Prost, Schumacher vs. Häkkinen, e mais recentemente Hamilton vs. Verstappen. Essas batalhas alimentam a tensão na pista, com os pilotos muitas vezes levando os limites de suas habilidades ao extremo.
                        </p>
                        <p>
                            A Fórmula 1 continua sendo um dos esportes mais assistidos do mundo — uma combinação perfeita de velocidade, tecnologia e habilidade humana. Com esforços de sustentabilidade como a neutralidade de carbono até 2030 e avanços tecnológicos contínuos, a F1 continuará a capturar a imaginação de milhões.
                        </p>
                    </div>
                </div>

                {/* CTA Login / Conta */}
                {!currentUser ? (
                    <div className="LoginMessage">
                        <h3>Faça Login ou Registre-se para acessar todas as estatísticas!</h3>
                        <div className="buttons">
                            <button className="LoginButton">
                                <Link to="/login" title="Acesse sua conta do portal Formula 1 Statistics">Login</Link>
                            </button>
                            <button className="LoginButton Register">
                                <Link to="/register" title="Crie sua nova conta no portal Formula 1 Statistics">Registrar</Link>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="LoginMessage">
                        <h3>Bem-vindo(a), {userName} 🏎️</h3>
                        <div className="buttons">
                            <button onClick={handleLogout} className="LoginButton">
                                Sair
                            </button>
                            <button onClick={handleAccountDeletion} className="LoginButton Delete">
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <Footer />
        </>
    );
}

export default Home;