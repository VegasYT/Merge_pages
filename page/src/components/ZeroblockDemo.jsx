import React from 'react';
import ZeroblockRenderer from './ZeroblockRenderer';
import { mockZeroblock } from '../data/mockData';

/**
 * Демонстрационная страница для ZeroblockRenderer
 * Показывает как работает адаптивный рендеринг зероблока
 */
export default function ZeroblockDemo() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Заголовок */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#1f2937',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
          Демонстрация Zeroblock Renderer
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
          Измените размер окна браузера, чтобы увидеть адаптивность
        </p>
      </div>

      {/* Информация о брейкпоинтах */}
      <div
        style={{
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            Брейкпоинты:
          </h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {mockZeroblock.zeroBlockResponsive.map(bp => (
              <div
                key={bp.id}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                  {bp.props.name}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {bp.width}x{bp.height}px
                </div>
                {bp.props.isDefault && (
                  <div
                    style={{
                      marginTop: '5px',
                      fontSize: '11px',
                      color: '#059669',
                      fontWeight: '500'
                    }}
                  >
                    По умолчанию
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Информация об элементах */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600' }}>
            Элементы в зероблоке:
          </h2>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            {mockZeroblock.zeroLayers.map((layer, index) => {
              const baseElement = mockZeroblock.zeroBaseElements.find(
                el => el.id === layer.zero_base_element_id
              );
              return (
                <div
                  key={layer.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'transparent',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}
                >
                  <strong>{baseElement?.display_name}</strong>
                  {' - '}
                  {layer.data.props.content || baseElement?.display_name}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Рендер зероблока */}
      <div
        style={{
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <ZeroblockRenderer zeroblockData={mockZeroblock} />
        </div>
      </div>

      {/* Инструкция */}
      <div
        style={{
          padding: '20px',
          maxWidth: '1200px',
          margin: '20px auto',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}
      >
        <p style={{ margin: '0 0 10px 0' }}>
          💡 <strong>Совет:</strong> Измените размер окна браузера, чтобы увидеть,
          как элементы адаптируются под разные экраны
        </p>
        <p style={{ margin: 0 }}>
          Компонент автоматически выбирает подходящий брейкпоинт на основе ширины экрана
          и применяет соответствующие позиции, размеры и стили к элементам
        </p>
      </div>
    </div>
  );
}
