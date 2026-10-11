import React, { useState, useEffect } from 'react';

/**
 * AvatarList - Componente para el renderizado dinámico de jugadores/avatares
 * Consumo de API falsa (JSONPlaceholder) para simular competidores en las Gorilimpiadas.
 * 
 * @param {Object} props
 * @param {Object} props.selectedAvatar - Avatar actualmente seleccionado
 * @param {Function} props.onSelectAvatar - Callback al seleccionar un competidor
 */
export const AvatarList = ({ selectedAvatar, onSelectAvatar }) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lista de emojis temáticos de la jungla para complementar cada personaje
  const jungleEmojis = ['🦍', '🦧', '🐒', '🐆', '🦜', '🐊', '🐅', '🐘', '🦏', '🦁'];

  const fetchAvatars = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const data = await response.json();
      
      // Mapear los datos de usuarios a competidores de las Gorilimpiadas
      const adaptedAvatars = data.map((user, index) => ({
        id: user.id,
        name: user.name,
        gamerTag: `@${user.username}`,
        team: user.company?.name || 'Equipo Jungla Salvaje',
        avatarEmoji: jungleEmojis[index % jungleEmojis.length],
        specialty: index % 2 === 0 ? 'Salto de Lianas' : 'Lanzamiento de Coco'
      }));

      setAvatars(adaptedAvatars);

      // Si no hay ninguno seleccionado, seleccionar el primero por defecto
      if (!selectedAvatar && adaptedAvatars.length > 0) {
        onSelectAvatar(adaptedAvatars[0]);
      }
    } catch (err) {
      console.error('Error al cargar avatares:', err);
      setError('No se pudo conectar con el lobby de competidores. Modo Offline activado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  return (
    <div className="avatar-list-container">
      <div className="avatar-header-row">
        <h3 className="section-title">
          <span>👥</span> Selección de Gorila Atleta
        </h3>
        <button 
          className="btn-refresh" 
          onClick={fetchAvatars}
          disabled={loading}
          title="Recargar competidores"
        >
          🔄 Actualizar
        </button>
      </div>

      {loading && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Convocando gorilas desde la selva...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-box">
          <p>⚠️ {error}</p>
          <button className="btn-refresh" onClick={fetchAvatars}>
            Reintentar Conexión
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="avatar-grid">
          {avatars.map((avatar) => {
            const isSelected = selectedAvatar?.id === avatar.id;
            return (
              <div
                key={avatar.id}
                className={`avatar-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectAvatar(avatar)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectAvatar(avatar);
                  }
                }}
              >
                <div className="avatar-info">
                  <div className="avatar-badge-icon">
                    {avatar.avatarEmoji}
                  </div>
                  <div className="avatar-details">
                    <h4>{avatar.name}</h4>
                    <p>{avatar.gamerTag} • {avatar.specialty}</p>
                  </div>
                </div>

                <button className="avatar-select-btn">
                  {isSelected ? '✓ Activo' : 'Elegir'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvatarList;
