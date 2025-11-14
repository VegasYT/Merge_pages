import React from 'react';

// Компонент предпросмотра Zero Block с адаптивными стилями
export default function ZeroBlockPreview({ viewportSize }) {
  const getStyles = () => {
    if (viewportSize === 'mobile') {
      return {
        padding: '4rem 1rem',
        iconSize: 'w-16 h-16 text-2xl',
        titleSize: 'text-2xl',
        textSize: 'text-base'
      };
    } else if (viewportSize === 'tablet') {
      return {
        padding: '5rem 1.5rem',
        iconSize: 'w-20 h-20 text-3xl',
        titleSize: 'text-3xl',
        textSize: 'text-lg'
      };
    }
    return {
      padding: '8rem 2rem',
      iconSize: 'w-24 h-24 text-4xl',
      titleSize: 'text-4xl',
      textSize: 'text-xl'
    };
  };

  const s = getStyles();

  return (
    <div className="bg-gradient-to-br from-purple-400 to-pink-500" style={{ padding: s.padding }}>
      <div className="max-w-6xl mx-auto text-center">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 sm:p-10 md:p-12">
          <div className={`${s.iconSize} bg-white rounded-full mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center`}>
            <span className={`${s.iconSize.split(' ')[2]} font-bold text-purple-600`}>Z</span>
          </div>
          <h2 className={`${s.titleSize} font-bold text-white mb-3 sm:mb-4`}>Zero Block</h2>
          <p className={`${s.textSize} text-white opacity-90`}>
            Кастомный блок с вашим уникальным дизайном
          </p>
        </div>
      </div>
    </div>
  );
}
