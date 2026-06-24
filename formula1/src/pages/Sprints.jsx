import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Loading from "../components/Loading.jsx";
import SessionCard from "../components/SessionCard.jsx";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';
import { Helmet } from 'react-helmet-async';
import { f1ApiService } from "../services/f1ApiService.js";

import "../styles/Page.css";
import "../styles/FlipCard.css";

// --- Funções Auxiliares de API e Cache ---

// --- Componente Sprints ---

function Sprints() {
    const { currentUser } = useAuth(); // <--- Adicione esta linha para acessar o usuário logado

    const [year, setYear] = useState(() => {
        const savedYear = localStorage.getItem("f1SelectedYear");
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
                    (session) => session.session_type === "Sprint" || session.session_name.includes("Sprint")
                );

                if (relevantSessions.length === 0) {
                    throw new Error(`Nenhuma Sprint encontrada para ${year}.`);
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
        localStorage.setItem("f1SelectedYear", JSON.stringify(year));
    }, [year]);

    const sprintSessionsDisplay = currentYearSessions;

    // O loading principal agora é ativado se o ano atual está carregando
    const showOverallLoading = isLoadingCurrentYearData;

    return (
        <>
            <Helmet>
                <title>Sprints {year} | Fórmula 1 Statistics</title>
                <meta name="description" content={`Confira os resultados das sessões de Sprint da Fórmula 1 para ${year}. Datas, horários, circuitos e tempos mais rápidos.`} />
                <meta property="og:title" content={`Sprints ${year} | Fórmula 1 Statistics`} />
                <meta property="og:url" content="https://formula1-statistics.vercel.app/sprints" />
            </Helmet>
            <Header />
            <section>
                {!currentUser ? ( // <--- Início da lógica de autenticação
                    <div className="LoginMessage Block">
                        <div>
                            <h1 className="title">Sprints - F1 </h1>
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
                            <h1 className="title">Sprints - F1 {year}</h1>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                title="Selecione o ano para ver os Sprints de F1"
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

                        {/* Renderiza os cards SOMENTE quando o loading do ano atual estiver FALSE e não houver erro */}
                        {!showOverallLoading && !currentYearError && (
                            <article className="qualifying-cards-container">
                                {sprintSessionsDisplay.length > 0
                                    ? sprintSessionsDisplay.map((session) => (
                                        <SessionCard
                                            key={session.session_key}
                                            session={session}
                                            flippedCardKey={flippedCardKey}
                                            setFlippedCardKey={setFlippedCardKey}
                                        />
                                    ))
                                    : (!showOverallLoading && !currentYearError && <p>Nenhuma Sprint encontrada para {year}.</p>)
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

export default Sprints;