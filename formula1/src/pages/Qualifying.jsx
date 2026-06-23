import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Loading from "../components/Loading.jsx";
import SessionCard from "../components/SessionCard.jsx";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext.jsx';
import { Helmet } from 'react-helmet-async';

import "../styles/Page.css";
import "../styles/FlipCard.css";

// --- Funções Auxiliares de API e Cache (MANTENHA AS MESMAS) ---
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url, retries = 5, initialDelayMs = 1000) {
    let currentDelay = initialDelayMs;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.status === 429) {
                console.warn(
                    `[API Warning] Rate limit hit for ${url}. Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${retries})`
                );
                await delay(currentDelay);
                currentDelay = Math.min(currentDelay * 2, 8000);
                continue;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} for ${url}`);
            }
            return response.json();
        } catch (error) {
            console.error(
                `[API Error] Failed to fetch ${url} (Attempt ${i + 1}/${retries}):`,
                error
            );
            if (i === retries - 1) {
                throw error;
            }
            await delay(currentDelay);
            currentDelay = Math.min(currentDelay * 2, 8000);
        }
    }
    return null;
}

// --- Componente Qualifying ---

function Qualifying() {
    const { currentUser } = useAuth();

    const [year, setYear] = useState(() => {
        const savedYear = localStorage.getItem("f1SelectedQualifyingYear");
        return savedYear ? JSON.parse(savedYear) : "2025";
    });

    const [currentYearSessions, setCurrentYearSessions] = useState([]);
    const [allQualifyingFastestLapsData, setAllQualifyingFastestLapsData] = useState({});
    const [isLoadingCurrentYearData, setIsLoadingCurrentYearData] = useState(true);
    const [currentYearError, setCurrentYearError] = useState(null);
    const [flippedCardKey, setFlippedCardKey] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchSessionsForYear = async () => {
            setIsLoadingCurrentYearData(true);
            setCurrentYearError(null);
            try {
                const cacheKey = `f1QualifyingSessions_${year}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
                        if (isMounted) {
                            setCurrentYearSessions(parsed.data);
                            setIsLoadingCurrentYearData(false);
                        }
                        return;
                    }
                }

                const res = await fetch(`https://api.openf1.org/v1/sessions?year=${year}`);
                if (res.status === 429) throw new Error("A API da F1 está sobrecarregada (Limite de requisições excedido). Tente novamente em alguns minutos.");
                if (!res.ok) throw new Error("Erro de conexão com a API da Fórmula 1.");
                
                const data = await res.json();
                
                const relevantSessions = data.filter(
                    (session) => session.session_type === "Qualifying" || session.session_name.includes("Qualifying")
                );

                if (relevantSessions.length === 0) {
                    throw new Error(`Nenhuma Qualificação encontrada para ${year}.`);
                }

                localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: relevantSessions }));

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
                                            fastestLapData={currentYearFastestLaps[session.session_key]}
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