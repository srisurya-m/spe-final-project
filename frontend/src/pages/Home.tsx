import { useState, useEffect } from 'react';
import ac from '../assets/AC.jpeg';
import painting from "../assets/Interior and Exterior Painting Waterloo.jpeg"
import cleaning from "../assets/cleaning.jpeg"
import delivery from "../assets/delivery.jpeg"
import mechanic from "../assets/mechanic.jpeg"
import physiotherapy from '../assets/physiotherapy.jpeg';

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [activeService, setActiveService] = useState<number | null>(null);

  const imagesList = [
    { id: 1, src: delivery, alt: "Delivery" },
    { id: 2, src: mechanic, alt: "Mechanic" },
    { id: 3, src: physiotherapy, alt: "Physiotherapy" },
  ];

  const servicesList = [
    { id: 1, imgSrc: cleaning, text: "Cleaning services for your home and office." },
    { id: 2, imgSrc: mechanic, text: "Expert mechanical services for your vehicle." },
    { id: 3, imgSrc: physiotherapy, text: "Physiotherapy for pain relief and recovery." },
    { id: 4, imgSrc: delivery, text: "Professional plumbing services for your needs." },
    { id: 5, imgSrc: painting, text: "Gardening services to beautify your outdoor space." },
    { id: 6, imgSrc: ac, text: "Interior and exterior painting services." },
  ];

  const handleDotClick = (index: number) => {
    setCurrentImage(index);
  };

  const handleServiceClick = (id: number) => {
    setActiveService(activeService === id ? null : id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % imagesList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-loaderpage">
  <div className="home-images">
    <img src={imagesList[currentImage].src} alt={imagesList[currentImage].alt} />
  </div>
  <div className="home-dots">
    {imagesList.map((_, index) => (
      <div
        key={index}
        className={`home-dot ${currentImage === index ? 'active' : ''}`}
        onClick={() => handleDotClick(index)}
      ></div>
    ))}
  </div>
  <div className='home-servicesmain'>
    <h3 className='home-heading'>Some of our services</h3>
    <div className='home-services'>
      {servicesList.map(service => (
        <div
          key={service.id}
          className={`home-service-box ${activeService === service.id ? 'active' : ''}`}
          onClick={() => handleServiceClick(service.id)}
        >
          <img src={service.imgSrc} alt={`Service ${service.id}`} />
          <div className={`home-dropdown ${activeService === service.id ? 'active' : ''}`}>
            {service.text}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  );
};

export default Home;
