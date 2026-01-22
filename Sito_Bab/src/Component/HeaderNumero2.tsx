/* Il tuo file: src/Header.tsx */

import React from "react";

// 1. IMPORTA tutte le 4 immagini che abbiamo copiato
// (Nota il percorso ./ che parte da src/)
import headerBgImage from './assets/antoine-barres.jpg';
import fogImage from './assets/fog-low.png';
import cloudsImage from './assets/clouds.png';
import logoImage from './assets/creative-tim-white-slim2.png';

// 2. IMPORTA il nostro CSS
import './CSS/HeaderNumero2.css';

// Questo componente è più semplice: niente 'useEffect' o 'useRef'
function HeaderNumero2() {
  return (
    <>
      <div
        className="page-header section-dark"
        style={{
          backgroundImage: `url(${headerBgImage})`,
        }}
      >
        <div className="filter" /> {/* Il filtro scuro */}

        {/* Questo era il div <Container> tradotto */}
        <div className="content-center">
          <div className="container">
            <div className="title-brand">
              <h1 className="presentation-title">Il Tuo B&B</h1>
              <div className="fog-low">
                <img alt="Nebbia" src={fogImage} />
              </div>
              <div className="fog-low right">
                <img alt="Nebbia" src={fogImage} />
              </div>
            </div>

            <h2 className="presentation-subtitle text-center">
              Un B&B fantastico per le tue vacanze.
            </h2>
          </div>
        </div>

        {/* Le nuvole (richiedono CSS speciale) */}
        <div
          className="moving-clouds"
          style={{
            backgroundImage: `url(${cloudsImage})`,
          }}
        />
        
        {/* Questo è solo il logo dei creatori, puoi anche cancellarlo */}
        <h6 className="category category-absolute">
          Template da{" "}
          <a href="https://www.creative-tim.com" target="_blank" rel="noopener noreferrer">
            <img
              alt="Logo Creative Tim"
              className="creative-tim-logo"
              src={logoImage}
            />
          </a>
        </h6>
      </div>
    </>
  );
}

export default HeaderNumero2;