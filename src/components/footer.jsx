import './footer.css';

function Footer() {
    const isAdmLogado = localStorage.getItem('admLogado') === 'true';

    return (
        <div className={`footer ${isAdmLogado ? 'footer-adm' : ''}`}>
            {/* conteúdo do footer */}
        </div>
    );
}

export default Footer;
