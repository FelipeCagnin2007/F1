import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Loading from "../components/Loading.jsx";
import SessionCard from "../components/SessionCard.jsx";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { f1ApiService } from "../services/f1ApiService.js";
import "../styles/Page.css";
import "../styles/FlipCard.css";

// --- Componente Practices ---

function Practices() {
    const [year, setYear] = useState(() => {
        const savedYear = localStorage.getItem("f1SelectedPracticeYear");
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
                    (session) => session.session_type === "Practice" || session.session_name.includes("Practice")
                );

                if (relevantSessions.length === 0) {
                    throw new Error(`Nenhum Treino encontrado para ${year}.`);
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
        localStorage.setItem("f1SelectedPracticeYear", JSON.stringify(year));
    }, [year]);

    // O MACETE AQUI: Filtrar as sessões por tipo de treino livre
    const fp1SessionsDisplay = currentYearSessions.filter(
        (session) => session.session_name === "Practice 1"
    );
    const fp2SessionsDisplay = currentYearSessions.filter(
        (session) => session.session_name === "Practice 2"
    );
    const fp3SessionsDisplay = currentYearSessions.filter(
        (session) => session.session_name === "Practice 3"
    );

    // O loading principal agora é ativado se o ano atual está carregando
    const showOverallLoading = isLoadingCurrentYearData;

    return (
        <>
            <Helmet>
                <title>Treinos Livres {year} | Fórmula 1 Statistics</title>
                <meta name="description" content={`Confira os resultados das sessões de Treinos Livres da Fórmula 1 para ${year}. Datas, horários, circuitos e tempos mais rápidos.`} />
                <meta property="og:title" content={`Treinos Livres ${year} | Fórmula 1 Statistics`} />
                <meta property="og:url" content="https://formula1-statistics.vercel.app/pratices" />
            </Helmet>
            <Header />
            <section>
                <div className="container tags">
                    <h1 className="page-title">Treinos Livres <span>F1 {year}</span></h1>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        title="Selecione o ano para ver os Treinos Livres"
                    >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                    </select>
                </div>

                {/* Display loading only when the current year's data is being loaded */}
                {showOverallLoading && !currentYearError && (
                    <>
                        <br />
                        <Loading />
                        <p className="loading-message">
                            Carregando dados para o ano {year}...
                        </p>
                    </>
                )}

                {currentYearError && <p className="error">Erro: {currentYearError}</p>} {/* Corrigido 'Error' para 'Erro' */}

                {/* Display content only when not loading the current year and no error */}
                {!showOverallLoading && !currentYearError && ( // Usando showOverallLoading
                    <article className="qualifying-cards-container">
                        {/* Seção para Treino Livre 1 */}
                        {fp1SessionsDisplay.length > 0 ? (
                            <>
                                {fp1SessionsDisplay.map((session) => (
                                    <SessionCard
                                        key={session.session_key}
                                        session={session}
                                        flippedCardKey={flippedCardKey}
                                        setFlippedCardKey={setFlippedCardKey}
                                    />
                                ))}
                            </>
                        ) : (
                            <p>Nenhum Treino Livre 1 encontrado para {year}.</p>
                        )}

                        {/* Seção para Treino Livre 2 */}
                        {fp2SessionsDisplay.length > 0 ? (
                            <>
                                {fp2SessionsDisplay.map((session) => (
                                    <SessionCard
                                        key={session.session_key}
                                        session={session}
                                        flippedCardKey={flippedCardKey}
                                        setFlippedCardKey={setFlippedCardKey}
                                    />
                                ))}
                            </>
                        ) : (
                            <p>Nenhum Treino Livre 2 encontrado para {year}.</p>
                        )}

                        {/* Seção para Treino Livre 3 */}
                        {fp3SessionsDisplay.length > 0 ? (
                            <>
                                {fp3SessionsDisplay.map((session) => (
                                    <SessionCard
                                        key={session.session_key}
                                        session={session}
                                        flippedCardKey={flippedCardKey}
                                        setFlippedCardKey={setFlippedCardKey}
                                    />
                                ))}
                            </>
                        ) : (
                            <p>Nenhum Treino Livre 3 encontrado para {year}.</p>
                        )}
                        {/* Mensagem geral se não houver treinos para o ano selecionado */}
                        {fp1SessionsDisplay.length === 0 &&
                         fp2SessionsDisplay.length === 0 &&
                         fp3SessionsDisplay.length === 0 &&
                         !showOverallLoading && !currentYearError && (
                            <p>Nenhum Treino Livre encontrado para {year}.</p>
                        )}
                    </article>
                )}
            </section>
            <Footer />
        </>
    );
}

export default Practices;