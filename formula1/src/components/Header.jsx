import { useEffect, useState } from 'react';
import NavBar from './NavBar.jsx';
import Logo from '../assets/formula1-noback.png';
import { Link } from 'react-router-dom';
import "../styles/Header.css";

function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 8);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={scrolled ? 'scrolled' : ''}>
            <NavBar />
            <Link to="/" className="header-logo-link" aria-label="Ir para página inicial — Fórmula 1 Statistics">
                <img src={Logo} alt="Fórmula 1 Statistics" className="header-logo" />
            </Link>
        </header>
    );
}

export default Header;