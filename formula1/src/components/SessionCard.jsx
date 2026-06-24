import { memo, useState, useEffect } from "react";
import { f1ApiService } from "../services/f1ApiService.js";

// Formata segundos em MM:SS.mmm
const formatLapTime = (seconds) => {
    if (typeof seconds !== "number" || isNaN(seconds)) return "N/A";
    if (seconds === 0) return "---"; // Falha no carregamento
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const milliseconds = Math.round(
        (remainingSeconds - Math.floor(remainingSeconds)) * 1000
    );
    return `${String(minutes).padStart(2, "0")}:${String(
        Math.floor(remainingSeconds)
    ).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
};

const SessionCard = memo(({ session, flippedCardKey, setFlippedCardKey }) => {
    const isFlipped = flippedCardKey === session.session_key;
    
    // Estado local para armazenar a volta mais rápida
    const [fastestLapData, setFastestLapData] = useState(null);
    const [loadingLap, setLoadingLap] = useState(false);

    // Efeito para buscar a volta mais rápida APENAS quando o card for virado
    useEffect(() => {
        if (isFlipped && !fastestLapData && !loadingLap) {
            let isMounted = true;
            setLoadingLap(true);
            
            const fetchBestLapData = async () => {
                try {
                    const isRace = session.session_type === "Race" || session.session_name.includes("Race");
                    const data = await f1ApiService.getFastestLapForSession(session.session_key, isRace);
                    
                    if (!data) {
                        if (isMounted) {
                            setFastestLapData({ driverName: "Tempo não disponível", lapTime: 0, teamColour: "E10600" });
                            setLoadingLap(false);
                        }
                        return;
                    }

                    if (isMounted) {
                        setFastestLapData(data);
                        setLoadingLap(false);
                    }
                } catch (err) {
                    console.error("Erro ao buscar melhor volta:", err);
                    if (isMounted) {
                        setFastestLapData({ driverName: "Erro ao carregar", lapTime: 0, teamColour: "E10600" });
                        setLoadingLap(false);
                    }
                }
            };
            
            fetchBestLapData();
            
            return () => { isMounted = false; };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFlipped, session.session_key]);

    const teamColour = fastestLapData?.teamColour || "E10600";

    const dateFormatted = new Date(session.date_start).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return (
        <div
            className="qualifying-card"
            onClick={() => setFlippedCardKey(isFlipped ? null : session.session_key)}
            role="button"
            tabIndex={0}
            aria-label={`${session.session_name} em ${session.circuit_short_name}. Clique para ver a volta mais rápida.`}
            onKeyDown={(e) => e.key === "Enter" && setFlippedCardKey(isFlipped ? null : session.session_key)}
        >
            <div className={`qualifying-card-inner ${isFlipped ? "is-flipped" : ""}`}>

                {/* Frente */}
                <div className="qualifying-card-front">
                    <p>
                        <strong>{session.circuit_short_name}</strong>{" "}
                        · {session.location}
                    </p>
                    <p>{session.country_name} ({session.country_code})</p>
                    <p>
                        <strong>{session.session_name}</strong> — {dateFormatted}
                    </p>
                </div>

                {/* Verso */}
                <div
                    className="qualifying-card-back"
                    style={{ backgroundColor: `#${teamColour}` }}
                >
                    <div className="qualifying-best-lap-background" />
                    {loadingLap ? (
                        <p>Carregando volta mais rápida...</p>
                    ) : fastestLapData ? (
                        <>
                            <p>Volta Mais Rápida</p>
                            <p>
                                {fastestLapData.driverName}
                                <br />
                                {formatLapTime(fastestLapData.lapTime)}
                            </p>
                        </>
                    ) : (
                        <p>Clique novamente para recarregar.</p>
                    )}
                </div>

            </div>
        </div>
    );
});

SessionCard.displayName = "SessionCard";

export default SessionCard;