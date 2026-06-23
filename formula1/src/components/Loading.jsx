import "../styles/Loading.css";

function Loading({ text = "Carregando dados..." }) {
    return (
        <div className="loading-wrapper">
            <div className="bars" aria-hidden="true">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <p className="loading-text">{text}</p>
        </div>
    );
}

export default Loading;