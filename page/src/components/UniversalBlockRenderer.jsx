import React from 'react';
import { filterClassesByViewport } from '../utils/styleUtils';

export default function UniversalBlockRenderer({ structure, data, styles, viewportSize }) {
  const renderElement = (element, index = 0, repeatData = null, isRoot = false) => {
    const { type, className = '', styles: elementStylesConfig = {}, children, dataKey, content, repeat, href, src, alt } = element;

    const elementStyles = {};
    
    const numericProperties = [
      'width', 'height', 'maxWidth', 'maxHeight', 'minWidth', 'minHeight',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
      'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing',
      'top', 'right', 'bottom', 'left', 'gap', 'columnGap', 'rowGap'
    ];

    Object.entries(elementStylesConfig).forEach(([cssProperty, styleKey]) => {
      let value = styles[styleKey];
      if (value !== undefined && value !== null && value !== '') {
        if (numericProperties.includes(cssProperty) && !isNaN(value) && typeof value !== 'string') {
          value = `${value}px`;
        } else if (numericProperties.includes(cssProperty) && typeof value === 'string' && /^\d+$/.test(value)) {
          value = `${value}px`;
        }
        elementStyles[cssProperty] = value;
      }
    });

    // Если это корневой элемент, не фильтруем классы - пусть background растягивается
    const filteredClassName = isRoot ? className : filterClassesByViewport(className, viewportSize);

    let textContent = '';
    if (dataKey) {
      if (repeatData && dataKey === '{{current}}') {
        textContent = repeatData;
      } else {
        textContent = data[dataKey] || '';
      }
    } else if (content) {
      if (content === '{{index}}') {
        textContent = String(index + 1);
      } else {
        textContent = content;
      }
    }

    if (repeat && children) {
      const items = [];
      for (let i = 0; i < repeat.count; i++) {
        const currentData = repeat.dataKeys ? data[repeat.dataKeys[i]] : null;
        items.push(
          <React.Fragment key={i}>
            {children.map((child, childIndex) => renderElement(child, i, currentData, false))}
          </React.Fragment>
        );
      }
      if (type === 'grid') {
        return (
          <div key={index} className={filteredClassName} style={elementStyles}>
            {items}
          </div>
        );
      }
      return items;
    }

    const props = {
      key: index,
      className: filteredClassName,
      style: elementStyles
    };

    switch (type) {
      case 'container':
      case 'div':
        return (
          <div {...props}>
            {textContent}
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </div>
        );
      case 'grid':
        return (
          <div {...props}>
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </div>
        );
      case 'h1':
        return <h1 {...props}>{textContent}</h1>;
      case 'h2':
        return <h2 {...props}>{textContent}</h2>;
      case 'h3':
        return <h3 {...props}>{textContent}</h3>;
      case 'h4':
        return <h4 {...props}>{textContent}</h4>;
      case 'h5':
        return <h5 {...props}>{textContent}</h5>;
      case 'h6':
        return <h6 {...props}>{textContent}</h6>;
      case 'p':
        return <p {...props}>{textContent}</p>;
      case 'span':
        return <span {...props}>{textContent}</span>;
      case 'a':
        return (
          <a {...props} href={href || data[element.hrefKey] || '#'}>
            {textContent}
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </a>
        );
      case 'img':
        return (
          <img 
            {...props} 
            src={src || data[element.srcKey] || ''} 
            alt={alt || data[element.altKey] || textContent || ''}
          />
        );
      case 'video':
        return (
          <video 
            {...props}
            src={src || data[element.srcKey] || ''}
            controls={element.controls !== false}
            autoPlay={element.autoPlay || false}
            loop={element.loop || false}
            muted={element.muted || false}
            poster={element.poster || data[element.posterKey] || ''}
          >
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </video>
        );
      case 'audio':
        return (
          <audio 
            {...props}
            src={src || data[element.srcKey] || ''}
            controls={element.controls !== false}
            autoPlay={element.autoPlay || false}
            loop={element.loop || false}
            muted={element.muted || false}
          >
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </audio>
        );
      case 'iframe':
        return (
          <iframe 
            {...props}
            src={src || data[element.srcKey] || ''}
            title={element.title || data[element.titleKey] || ''}
            allowFullScreen={element.allowFullScreen || false}
          />
        );
      case 'svg':
        return (
          <svg 
            {...props}
            viewBox={element.viewBox || '0 0 100 100'}
            xmlns="http://www.w3.org/2000/svg"
          >
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </svg>
        );
      case 'button':
        return (
          <button {...props}>
            {textContent}
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </button>
        );
      case 'ul':
        return (
          <ul {...props}>
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </ul>
        );
      case 'ol':
        return (
          <ol {...props}>
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </ol>
        );
      case 'li':
        return (
          <li {...props}>
            {textContent}
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </li>
        );
      case 'strong':
        return <strong {...props}>{textContent}</strong>;
      case 'em':
        return <em {...props}>{textContent}</em>;
      case 'small':
        return <small {...props}>{textContent}</small>;
      case 'br':
        return <br {...props} />;
      case 'hr':
        return <hr {...props} />;
      case 'label':
        return (
          <label {...props}>
            {textContent}
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </label>
        );
      case 'input':
        return (
          <input 
            {...props} 
            type={element.inputType || 'text'}
            placeholder={element.placeholder || data[element.placeholderKey] || ''}
            value={element.value || data[element.valueKey] || ''}
          />
        );
      case 'textarea':
        return (
          <textarea 
            {...props}
            placeholder={element.placeholder || data[element.placeholderKey] || ''}
            value={element.value || data[element.valueKey] || ''}
          />
        );
      case 'select':
        return (
          <select {...props}>
            {children && children.map((child, i) => renderElement(child, i, repeatData, false))}
          </select>
        );
      case 'option':
        return (
          <option {...props} value={element.value || textContent}>
            {textContent}
          </option>
        );
      default:
        return <div {...props}>{textContent}</div>;
    }
  };

  return (
    <>
      {structure.map((element, index) => renderElement(element, index, null, true))}
    </>
  );
}