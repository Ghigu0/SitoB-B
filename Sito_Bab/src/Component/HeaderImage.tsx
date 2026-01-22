import React, { useEffect, useRef } from "react"; // sono gli hooks, ti permettono di eseguire un blocco di codice dopo
                                                  // che react ha reindirizzato il contenuto di return
import headerImage from './assets/federico-beccari.jpg'; 
import './CSS/HeaderImage.css'

function ProfilePageHeader() {
  
  const pageHeader = useRef<HTMLDivElement>(null); // crei un oggetto contenitore persistente, che non viene resettato
                                                   // ogni volta che il componente di ri-renderizza
                                                   // null: la scatola è vuota
                                                   // HTMLDivElement: dici che in questa scatola accetti solo elementi div
  useEffect(() => {
   
    const updateScroll = () => { // funzione parallasse
                                 // è l'effetto parallasse, che quando scorri il sito l'immagine si alza lentamente 
                                 // e il contenuto sotto scorre veloe
        let windowScrollTop = window.pageYOffset / 3;
      
        if (pageHeader.current) { // controlli che il ref pageHeader non sia vuoto ( non dovrebbe esserlo )
            pageHeader.current.style.transform = "translate3d(0," + windowScrollTop + "px,0)";
        }
    };

    if (window.innerWidth < 991) {
        window.addEventListener("scroll", updateScroll);

        return function cleanup() { // le funzioni di return vengono eseguite quando smonti il componente, vengono definite 
                                    // nella useEffect
            window.removeEventListener("scroll", updateScroll);
        };
    }
  }); // Nota: questo useEffect si attiverà ad ogni render.
     // Per ora va bene, ma in futuro potresti voler aggiungere [] come secondo argomento.

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${headerImage})`,
        }}
        className="page-header page-header-xs" // DA DOVE PRENDI QUESTO CSS?
        
        ref={pageHeader} // lo metti dentro il Ref
      >
        <div className="filter" /> {/* scurisce un po' l'immagine*/}
      </div>
    </>
  );
}

export default ProfilePageHeader;