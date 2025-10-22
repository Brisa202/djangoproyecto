// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css'; 


import backgroundImage from '../assets/background.png'; 

const HomePage = () => {
    const navigate = useNavigate();

    return (
     
        <div 
            className="homepage-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="homepage-content"> 
                <h1>¡Bienvenido/a a Hollywood Producciones!</h1>
                <p className="homepage-text">Alquiler de vajillas para eventos inolvidables.</p>
                
                <button 
                    onClick={() => navigate('/login')}
                    className="homepage-button"
                >
                    Iniciar sesión
                </button>
            </div>
        </div>
    );
};

export default HomePage;