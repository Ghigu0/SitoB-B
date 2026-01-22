/* Il tuo file: src/Header.tsx */

// Importiamo gli hook di React
import React, { useEffect, useRef } from "react";

// 1. IMPORTA l'immagine nuova (con il percorso corretto ./ !)
import headerImage from '../assets/daniel-olahh.jpg';

// 2. IMPORTA il nostro CSS (dove metteremo gli stili)
import './CSS/HeaderCore.css';

function HeaderCore() {
  // 3. Usa 'useRef' (il modo moderno)
  const pageHeader = useRef<HTMLDivElement>(null);

  // 4. L'effetto parallax (ora con l'array [] per eseguirlo 1 sola volta!)
  useEffect(() => {
    const updateScroll = () => {
      let windowScrollTop = window.pageYOffset / 3;
      if (pageHeader.current) {
        pageHeader.current.style.transform =
          "translate3d(0," + windowScrollTop + "px,0)";
      }
    };

    if (window.innerWidth < 991) {
      window.addEventListener("scroll", updateScroll);
      return function cleanup() {
        window.removeEventListener("scroll", updateScroll);
      };
    }
  }, []); // <-- Aggiunto []! Eseguito solo 1 volta.

  // 5. Il return TRADOTTO (senza reactstrap)
  return (
    <>
      <div
        style={{
          backgroundImage: `url(${headerImage})`,
        }}
        className="page-header" // Ho rimosso 'page-header-xs'
        data-parallax={true}
        ref={pageHeader}
      >
        <div className="filter" /> {/* Il filtro scuro che già avevamo */}

        {/* Questo era <Container> */}
        <div className="container">
          <div className="motto text-center">
            <h1>Il B&B </h1>
            <h3>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</h3>
            <br />

            {/* Questo era un <Button> (lo traduciamo in <a>) */}
            <a
              href="#" // Cambia questo link!
              className="btn-round mr-1 btn-neutral"
              target="_blank"
            >
              <i className="fa fa-play" />
              Guarda il Video
            </a>

            {/* Questo era un <Button> (lo traduciamo in <button>) */}
            <button className="btn-round btn-neutral" type="button">
              Prenota Ora
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HeaderCore;