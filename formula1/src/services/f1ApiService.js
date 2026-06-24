import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Utilitário para buscar dados da F1 API usando o Firestore como camada de Cache.
 * Evita o erro 429 Too Many Requests salvando os dados no banco central.
 */

// Tempo de validade do cache local de memória (1 hora)
const CACHE_TTL_MS = 60 * 60 * 1000;

export const f1ApiService = {
    /**
     * Busca as sessões de um ano. 
     * Prioridade: 1) LocalStorage -> 2) Firestore -> 3) F1 API
     */
    async getSessionsForYear(year) {
        const cacheKey = `f1_sessions_${year}`;
        
        // 1. Verificar Cache Local (LocalStorage)
        const localCache = localStorage.getItem(cacheKey);
        if (localCache) {
            const parsed = JSON.parse(localCache);
            if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                console.log(`[Cache Local] Sessões de ${year} carregadas.`);
                return parsed.data;
            }
        }

        // 2. Verificar Firebase Firestore
        try {
            const docRef = doc(db, 'f1_sessions', year.toString());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const firestoreData = docSnap.data();
                // Se os dados no Firebase têm menos de 24 horas ou são de anos passados (nunca expira)
                const isPastYear = year < new Date().getFullYear();
                const isFresh = Date.now() - firestoreData.timestamp < 24 * 60 * 60 * 1000;
                
                if (isPastYear || isFresh) {
                    console.log(`[Firestore] Sessões de ${year} carregadas.`);
                    // Salva no LocalStorage
                    localStorage.setItem(cacheKey, JSON.stringify({
                        timestamp: Date.now(),
                        data: firestoreData.sessions
                    }));
                    return firestoreData.sessions;
                }
            }
        } catch (error) {
            console.error('[Firestore Error] Falha ao ler sessões:', error);
            // Continua para a API em caso de erro no Firestore (ex: regras de segurança faltando)
        }

        // 3. Buscar na API da F1
        console.log(`[F1 API] Buscando sessões de ${year} na API oficial...`);
        const res = await fetch(`https://api.openf1.org/v1/sessions?year=${year}`);
        
        if (res.status === 429) {
            throw new Error("A API da F1 está sobrecarregada (Limite de requisições excedido).");
        }
        if (!res.ok) {
            throw new Error(`Erro de conexão com a API: ${res.status}`);
        }

        const data = await res.json();

        if (!data || data.length === 0) {
            return []; // Sem sessões ainda
        }

        // 4. Salvar no Firestore e LocalStorage
        try {
            const docRef = doc(db, 'f1_sessions', year.toString());
            await setDoc(docRef, {
                sessions: data,
                timestamp: Date.now()
            });
            console.log(`[Firestore] Sessões de ${year} salvas no banco com sucesso!`);
        } catch (error) {
            console.error('[Firestore Error] Falha ao salvar sessões:', error);
        }

        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));

        return data;
    },

    /**
     * Busca a volta mais rápida de uma sessão e o piloto associado.
     * Prioridade: 1) LocalStorage -> 2) Firestore -> 3) F1 API
     */
    async getFastestLapForSession(sessionKey, isRace = false) {
        const cacheKey = `f1_fastest_lap_${sessionKey}`;
        
        // 1. Verificar Cache Local (LocalStorage)
        const localCache = localStorage.getItem(cacheKey);
        if (localCache) {
            const parsed = JSON.parse(localCache);
            if (Date.now() - parsed.timestamp < CACHE_TTL_MS * 24) { // Cache local dura 24h para voltas
                console.log(`[Cache Local] Melhor volta da sessão ${sessionKey} carregada.`);
                return parsed.data;
            }
        }

        // 2. Verificar Firebase Firestore
        try {
            const docRef = doc(db, 'f1_fastest_laps', sessionKey.toString());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(`[Firestore] Melhor volta da sessão ${sessionKey} carregada.`);
                const data = docSnap.data().lapData;
                
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: data
                }));
                return data;
            }
        } catch (error) {
            console.error('[Firestore Error] Falha ao ler melhor volta:', error);
        }

        // 3. Buscar na API da F1
        console.log(`[F1 API] Buscando melhor volta da sessão ${sessionKey}...`);
        
        try {
            let fastestLap = null;

            if (isRace) {
                // Para corridas, podemos buscar diretamente a volta mais rápida marcada
                const lapsRes = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&is_fastest_lap=true`);
                if (lapsRes.status === 404) {
                    fastestLap = null;
                } else if (!lapsRes.ok) {
                    throw new Error("Erro ao buscar voltas.");
                } else {
                    const laps = await lapsRes.json();
                    if (laps && laps.length > 0) fastestLap = laps[0];
                }
            } else {
                // Para Qualy/Sprint/Pratice, buscamos todas e achamos a menor
                const lapsRes = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&lap_duration>=0`);
                if (lapsRes.status === 404) {
                    fastestLap = null;
                } else if (!lapsRes.ok) {
                    throw new Error("Erro ao buscar voltas.");
                } else {
                    const laps = await lapsRes.json();
                    
                    if (laps && laps.length > 0) {
                        fastestLap = laps.reduce((min, current) => {
                            return (!min || current.lap_duration < min.lap_duration) ? current : min;
                        }, null);
                    }
                }
            }

            if (!fastestLap) {
                return null;
            }

            // Buscar dados do piloto
            const driverRes = await fetch(`https://api.openf1.org/v1/drivers?driver_number=${fastestLap.driver_number}&session_key=${sessionKey}`);
            let driverName = "Desconhecido";
            let teamColour = "666666";

            if (driverRes.ok) {
                const driverData = await driverRes.json();
                if (driverData && driverData.length > 0) {
                    driverName = driverData[0].broadcast_name;
                    teamColour = driverData[0].team_colour;
                }
            }

            const lapData = {
                session_key: sessionKey,
                driverName: driverName,
                lapTime: fastestLap.lap_duration,
                teamColour: teamColour
            };

            // 4. Salvar no Firestore e LocalStorage
            try {
                const docRef = doc(db, 'f1_fastest_laps', sessionKey.toString());
                await setDoc(docRef, {
                    lapData: lapData,
                    timestamp: Date.now()
                });
                console.log(`[Firestore] Melhor volta da sessão ${sessionKey} salva com sucesso!`);
            } catch (error) {
                console.error('[Firestore Error] Falha ao salvar melhor volta:', error);
            }

            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: lapData
            }));

            return lapData;
        } catch (error) {
            console.error(`[API Error] Erro ao buscar melhor volta ${sessionKey}:`, error);
            return null;
        }
    }
};
