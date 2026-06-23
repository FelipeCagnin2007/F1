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

const DEFAULT_CACHE_TTL_MINUTES = 60; // 1 hora de cache

const getCachedDataWithTTL = (key, ttlMinutes = DEFAULT_CACHE_TTL_MINUTES) => {
    const cachedItem = localStorage.getItem(key);
    if (!cachedItem) {
        return null;
    }
    try {
        const parsedItem = JSON.parse(cachedItem);
        const now = Date.now();
        if (now - parsedItem.timestamp > ttlMinutes * 60 * 1000) {
            console.log(`[Cache] Cache for ${key} expired. Removing.`);
            localStorage.removeItem(key);
            return null;
        }
        const yearFromKey = key.split('_').pop();
        if (parsedItem.data && Array.isArray(parsedItem.data) && parsedItem.data.length > 0 &&
            parsedItem.data[0]?.date?.substring(0, 4) !== yearFromKey &&
            parsedItem.data[0]?.session_key?.toString().substring(0, 4) !== yearFromKey) {
            console.log(`[Cache] Data for ${key} belongs to a different year (${parsedItem.data[0]?.date?.substring(0, 4) || parsedItem.data[0]?.session_key?.toString().substring(0, 4)} vs ${yearFromKey}). Removing.`);
            localStorage.removeItem(key);
            return null;
        }
        console.log(`[Cache] Loaded data for ${key} from cache.`);
        return parsedItem.data;
    } catch (e) {
        console.error(`[Cache Error] Error parsing cached data for ${key}:`, e);
        localStorage.removeItem(key);
        return null;
    }
};

const setCachedDataWithTTL = (key, data, ttlMinutes = DEFAULT_CACHE_TTL_MINUTES) => {
    const itemToStore = {
        timestamp: Date.now(),
        data: data,
    };
    localStorage.setItem(key, JSON.stringify(itemToStore));
    console.log(`[Cache] Data for ${key} saved to cache.`);
};

// --- Componente Races ---

function Races() {
    const { currentUser } = useAuth(); // <--- Adicione esta linha para acessar o usuário logado

    const [year, setYear] = useState(() => {
        const savedYear = localStorage.getItem("f1SelectedRaceYear"); // Nova chave
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
                const cacheKey = `f1RaceSessions_${year}`;
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
                    (session) => session.session_type === "Race" || session.session_name.includes("Race")
                );

                if (relevantSessions.length === 0) {
                    throw new Error(`Nenhuma Corrida encontrada para ${year}.`);
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
        localStorage.setItem("f1SelectedRaceYear", JSON.stringify(year)); // Nova chave
    }, [year]);

    const raceSessionsDisplay = currentYearSessions;
    const showOverallLoading = isLoadingCurrentYearData;

    return (
        <>
            <Helmet>
                <title>Corridas {year} | Fórmula 1 Statistics</title>
                <meta name="description" content={`Resultados das corridas de Fórmula 1 em ${year}. Datas, circuitos, países e tempos mais rápidos.`} />
                <meta property="og:title" content={`Corridas ${year} | Fórmula 1 Statistics`} />
                <meta property="og:url" content="https://formula1-statistics.vercel.app/races" />
            </Helmet>
            <Header />
            <section>
                {!currentUser ? ( // <--- Início da lógica de autenticação
                    <div className="LoginMessage Block">
                        <div>
                            <h1 className="title">Corridas - F1 </h1>
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
                            <h1 className="title">Corridas - F1 {year}</h1>
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                title="Selecione o ano para ver as Corridas de F1"
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
                            <article className="qualifying-cards-container"> {/* Pode manter o nome da classe CSS se o estilo for geral */}
                                {raceSessionsDisplay.length > 0
                                    ? raceSessionsDisplay.map((session) => (
                                        <SessionCard
                                            key={session.session_key}
                                            session={session}
                                            fastestLapData={currentYearFastestLaps[session.session_key]}
                                            flippedCardKey={flippedCardKey}
                                            setFlippedCardKey={setFlippedCardKey}
                                        />
                                    ))
                                    : (!showOverallLoading && !currentYearError && <p>Nenhuma Corrida encontrada para {year}.</p>)
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

export default Races;