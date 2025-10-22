import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/LoginPage.css';

// Imágenes
import backgroundImage from '../assets/background.png';
import logoImage from '../assets/logo.jpg';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ Usa tu endpoint personalizado del backend
      const response = await api.post('token/', {
        username: username,
        password: password,
      });

      // ✅ Guarda los tokens y los datos del usuario
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username_login', response.data.username);

      // ✅ Guarda roles también
      if (response.data.roles) {
        localStorage.setItem('roles', JSON.stringify(response.data.roles));
      }

      // ✅ Redirige al dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
  };

  return (
    <div
      className="login-page-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-box">
        <div className="logo-container">
          <img
            src={logoImage}
            alt="Hollywood Producciones Logo"
            className="logo-image"
          />
        </div>

        <h2 className="login-title">Iniciar sesión</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Introduce tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Introduce tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" className="checkbox-style" />
              Recordar contraseña
            </label>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
