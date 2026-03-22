import Navbar from "../components/common/NavBar";
import "../transit.css";
 
export default function Transit() {
  const montrealdirections = "https://www.google.com/maps?output=embed&ll=45.5017,-73.5673&z=13";
 
  return (
    <div className="transit-page">
      <Navbar />
      <div className="transit-map-container">
        <iframe
          className="transit-map-iframe"
          src={montrealdirections}
          title="Google Maps"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
 