import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/NavBar.css";

const NAV_ITEMS = [
    { label: "Início",        path: "/" },
    { label: "Treinos",       path: "/pratices" },
    { label: "Sprints",       path: "/sprints" },
    { label: "Corridas",      path: "/races" },
    { label: "Qualificações", path: "/qualifying" },
    { label: "Pilotos",       path: "/drivers" },
    { label: "Chat",          path: "/chat" },
    { label: "Sobre Mim",     path: "/contact" },
];

function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav aria-label="Navegação principal">
            {/* ---- Desktop: lista horizontal ---- */}
            <ul className="nav-list" role="list">
                {NAV_ITEMS.map((item) => (
                    <li key={item.path} className="nav-item">
                        <Link
                            to={item.path}
                            className={`nav-link ${isActive(item.path) ? "active" : ""}`}
                            aria-current={isActive(item.path) ? "page" : undefined}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>

            {/* ---- Mobile: botão hamburger ---- */}
            <button
                className={`nav-hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={menuOpen}
                aria-controls="nav-mobile-menu"
            >
                <span className="hamburger-line" aria-hidden="true" />
                <span className="hamburger-line" aria-hidden="true" />
                <span className="hamburger-line" aria-hidden="true" />
            </button>

            {/* ---- Mobile: menu fullscreen ---- */}
            <div
                id="nav-mobile-menu"
                className={`nav-mobile-menu ${menuOpen ? "open" : ""}`}
                aria-hidden={!menuOpen}
            >
                <ul className="nav-mobile-list" role="list">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`nav-mobile-link ${isActive(item.path) ? "active" : ""}`}
                                aria-current={isActive(item.path) ? "page" : undefined}
                                onClick={closeMenu}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;