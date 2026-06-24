import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Loading from "../components/Loading.jsx";
import SessionCard from "../components/SessionCard.jsx";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';
import { Helmet } from 'react-helmet-async';
import { f1ApiService } from "../services/f1ApiService.js";

import "../styles/Page.css";
import "../styles/FlipCard.css";

// --- Componente Qualifying ---

function Qualifying() {
    const { currentUser } = useAuth();

    const [year, setYear] = useState(() => {
        const savedYear = localStorage.getItem("f1SelectedQualifyingYear");
        return savedYear ? JSON.parse(savedYear) : "2025";
    });

    const [currentYearSessions, setCurrentYearSessions] = useState([]);
    const [isLoadingCurrentYearData, setIsLoadingCurrentYearData] = useState(true);
    const [currentYearError, setCurrentYearError] = useState(null);
    const [flippedCardKey, setFlippedCardKey] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchSessionsForYear = async () => {
            setIsLoadingCurrentYearData(true);
            setCurrentYearError(null);
            try {
                const data = await f1ApiService.getSessionsForYear(year);
                
                const relevantSessions = data.filter(
                    (session) => session.session_type === "Qualifying" || session.session_name.includes("Qualifying")
                );

                if (relevantSessions.length === 0) {
                    throw new Error(`Nenhuma Qualificação encontrada para ${year}.`);
                }

                if (isMounted) {
                    setCurrentYearSessions(relevantSessions);
                }
            } catch (err) {
                if (isMounted) setCurrentYearError(err.message);
            } finally {
                if (isMounted) setIsLoadingCurrentYearData(false);
            }
        };

        fetchSessionsForYear();

        return () => { isMounted = false; };
    }, [year]);

    // --- Efeito para salvar o ano selecionado no localStorage ---
    useEffect(() => {
        localStorage.setItem("f1SelectedQualifyingYear", JSON.stringify(year));
    }, [year]);

    const qualifyingSessionsDisplay = currentYearSessions;
    const showOverallLoading = isLoadingCurrentYearData;

    return (
        <>
            <Helmet>
                <title>Qualificações {year} | Fórmula 1 Statistics</title>
                <meta name="description" content={`Confira os resultados das sessões de Qualificação da Fórmula 1 para ${year}. Datas, horários, circuitos e tempos mais rápidos.`} />
                <meta property="og:title" content={`Qualificações ${year} | Fórmula 1 Statistics`} />
                <meta property="og:url" content="https://formula1-statistics.vercel.app/qualifying" />
            </Helmet>
            <Header />
            <section>
                {!currentUser ? ( // <--- Início da lógica de autenticação
                    <div className="LoginMessage Block">
                        <div>
                            <h1 className="title">Qualificações - F1 </h1>
                            <h3>Este conteúdo é restrito a Membros Registrados. Faça Login ou Registre uma conta para continuar!</h3>
                        </div>
                        <div className="buttons">
                            <button className="LoginButton">
                                <Link to="/login">Login</Link>
                            </button>
                            <button className="LoginButton Register">
                                <Link to="/register">Registrar</Link>
                            </button>
                        </div>
                    </div>
                ) : ( // <--- Fim da lógica de autenticação, início do conteúdo da página
                    <>
                        <div className="container tags">
                            <h1 className="title">Qualificações - F1 {year}</h1>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                title="Selecione o ano para ver as Qualificações de F1"
                            >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>

                        {showOverallLoading && !currentYearError && (
                            <>
                                <br />
                                <Loading />
                                <p className="loading-message">
                                    Carregando dados para o ano {year}...
                                </p>
                            </>
                        )}

                        {currentYearError && <p className="error">Erro: {currentYearError}</p>}

                        {!showOverallLoading && !currentYearError && (
                            <article className="qualifying-cards-container">
                                {qualifyingSessionsDisplay.length > 0
                                    ? qualifyingSessionsDisplay.map((session) => (
                                        <SessionCard
                                            key={session.session_key}
                                            session={session}
                                            flippedCardKey={flippedCardKey}
                                            setFlippedCardKey={setFlippedCardKey}
                                        />
                                    ))
                                    : (!showOverallLoading && !currentYearError && <p>Nenhuma Qualificação encontrada para {year}.</p>)
                                }
                            </article>
                        )}
                    </>
                )} {/* <--- Fim do conteúdo da página */}
            </section>
            <Footer />
        </>
    );
}

export default Qualifying;