import React, { useState, useEffect } from 'react';
import AvatarList from './AvatarList';
import './styles.css';

/**
 * App - Controlador Móvil PWA para "Gorilla Escape: Gorilimpiadas"
 * Actúa como gamepad táctil sincronizado con el avatar seleccionado.
 */
function App() {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [lastAction, setLastAction] = useState('Esperando comando...');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bananaEnergy, setBananaEnergy] = useState(100);

  // Monitoreo de conectividad (Online/Offline) para la PWA
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Función para manejar acciones con retroalimentación háptica en móvil
  const triggerAction = (actionName, energyCost = 0) => {
    // Si la API de vibración está disponible en el dispositivo móvil
    if ('vibrate' in navigator) {
      navigator.vibrate(energyCost > 0 ? [50, 30, 50] : 35);
    }

    if (energyCost > 0) {
      setBananaEnergy((prev) => Math.max(0, prev - energyCost));
    }

    setLastAction(actionName);
  };

  // Recarga de energía pasiva
  const rechargeEnergy = () => {
    setBananaEnergy(100);
    triggerAction('🍌 Energía de Plátano Recargada!');
  };

  return (
    <div className="app-container">
      {/* 1. Header con estado y avatar seleccionado */}
      <header className="game-header">
        <div className="header-top">
          <div className="brand-badge">
            <span className="brand-icon">🦍</span>
            <span className="brand-title">Gorilimpiadas</span>
          </div>

          <div className={`connection-indicator ${isOnline ? 'status-online' : 'status-offline'}`}>
            <span className="pulse-dot"></span>
            {isOnline ? 'En Línea' : 'Offline PWA'}
          </div>
        </div>

        <div className="selected-pilot-banner">
          <span>Competidor Activo:</span>
          <span className="pilot-highlight">
            {selectedAvatar ? `${selectedAvatar.avatarEmoji} ${selectedAvatar.name}` : 'Cargando...'}
          </span>
        </div>

        <div className="selected-pilot-banner">
          <span>Energía Banana: {bananaEnergy}%</span>
          <span 
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--color-banana)' }} 
            onClick={rechargeEnergy}
          >
            + Recargar
          </span>
        </div>
      </header>

      {/* 2. Control de Mando Táctil (Gamepad Mobile) */}
      <section className="controller-section">
        <div className="section-title">
          <span>🎮</span> Mando de Navegación Selva
        </div>

        {/* D-Pad direccional en cuadrícula */}
        <div className="dpad-container">
          <button 
            className="btn-game-touch btn-dpad btn-up"
            onClick={() => triggerAction('⬆️ Trepar Liana (Arriba)')}
            aria-label="Mover Arriba"
          >
            ▲
          </button>
          
          <button 
            className="btn-game-touch btn-dpad btn-left"
            onClick={() => triggerAction('⬅️ Esquivar Izquierda')}
            aria-label="Mover Izquierda"
          >
            ◀
          </button>

          <div className="dpad-center">
            🌴
          </div>

          <button 
            className="btn-game-touch btn-dpad btn-right"
            onClick={() => triggerAction('➡️ Esquivar Derecha')}
            aria-label="Mover Derecha"
          >
            ▶
          </button>

          <button 
            className="btn-game-touch btn-dpad btn-down"
            onClick={() => triggerAction('⬇️ Deslizarse por Raíces')}
            aria-label="Mover Abajo"
          >
            ▼
          </button>
        </div>

        {/* Botones de Acción Rápida (Grandes para pulgar móvil) */}
        <div className="action-pad-grid">
          <button 
            className="btn-game-touch btn-action-jump"
            onClick={() => triggerAction('🦘 SÚPER SALTO GORILA', 10)}
          >
            <span>SALTO</span>
            <span className="btn-subtext">Liana Aérea</span>
          </button>

          <button 
            className="btn-game-touch btn-action-boost"
            onClick={() => triggerAction('🔥 TURBO ESCAPE ACELERA', 20)}
          >
            <span>TURBO ESCAPE</span>
            <span className="btn-subtext">Escape Rápido</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-banana)' }}>
          Último Comando: <strong>{lastAction}</strong>
        </div>
      </section>

      {/* 3. Renderizado Dinámico de Jugadores / Avatares */}
      <AvatarList 
        selectedAvatar={selectedAvatar} 
        onSelectAvatar={(avatar) => {
          setSelectedAvatar(avatar);
          triggerAction(`Seleccionado: ${avatar.name}`);
        }} 
      />

      {/* Footer del Proyecto Integrador */}
      <footer className="game-footer">
        <p>Gorilla Escape: Gorilimpiadas © 2026 PWA Mobile Controller</p>
        <p>Desarrollado con React & Service Worker por Hiram</p>
      </footer>
    </div>
  );
}

export default App;
