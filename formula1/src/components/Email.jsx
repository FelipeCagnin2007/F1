import { useState } from "react";
import emailjs from "emailjs-com";
import "../styles/Email.css";

function EmailForm() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [status, setStatus] = useState("idle"); // idle | sending | success | error

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus("sending");

        emailjs.send(
            "service_vasotur",
            "template_b164ekm",
            { email, name },
            "AEf0rLomnd13Rvmw6"
        ).then(() => {
            setStatus("success");
            setEmail("");
            setName("");
        }).catch((err) => {
            console.error(err);
            setStatus("error");
        });
    };

    if (status === "success") {
        return (
            <div className="email-success">
                <span style={{ fontSize: "2rem" }}>✅</span>
                <h3>E-mail enviado com sucesso!</h3>
                <p style={{ fontSize: "0.875rem", color: "#495057" }}>
                    Obrigado pelo contato, {name || "visitante"}! Responderei em breve.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={sendEmail} className="email-form" noValidate>
            <input
                type="text"
                placeholder="Seu nome"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Seu nome"
                disabled={status === "sending"}
            />
            <input
                type="email"
                placeholder="Seu e-mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Seu e-mail"
                disabled={status === "sending"}
            />
            {status === "error" && (
                <p style={{
                    color: "var(--color-error)",
                    fontSize: "var(--text-sm)",
                    background: "var(--color-error-light)",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(220,53,69,0.2)"
                }}>
                    Erro ao enviar. Tente novamente mais tarde.
                </p>
            )}
            <button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Enviando..." : "Enviar Mensagem"}
            </button>
        </form>
    );
}

export default EmailForm;