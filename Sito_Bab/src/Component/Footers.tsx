/* Il tuo file: src/components/Footer.tsx */

import React from "react";

// 1. Importiamo il nostro file CSS dedicato
import './CSS/Footers.css';

function Footer() {
  return (
    // Queste classi vengono dal template originale
    <footer className="footer footer-black footer-white">
      
      {/* Questo era il <Container> di reactstrap */}
      <div className="container">
        
        {/* Questo era il <Row> di reactstrap */}
        <div className="row">
          
          {/* Ho cambiato i link per il tuo B&B */}
          <nav className="footer-nav">
            <ul>
              <li>
                <a href="#home">Home</a> {/* Cambia #home con il tuo link */}
              </li>
              <li>
                <a href="#camere">Camere</a>
              </li>
              <li>
                <a href="#contatti">Contatti</a>
              </li>
            </ul>
          </nav>

          {/* Il copyright (ho aggiornato l'anno e il nome) */}
          <div className="credits ml-auto">
            <span className="copyright">
              © {new Date().getFullYear()}, B&B del mio Amico.
              Fatto con <i className="fa fa-heart heart" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;