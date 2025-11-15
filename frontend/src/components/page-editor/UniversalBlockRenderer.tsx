import React from 'react';
import { filterClassesByViewport } from '@/lib/utils/style-utils';

interface UniversalBlockRendererProps {
	structure: any[];
	data: Record<string, any>;
	styles: Record<string, any>;
	viewportSize: 'mobile' | 'tablet' | 'desktop';
}

export default function UniversalBlockRenderer({ structure, data, styles, viewportSize }: UniversalBlockRendererProps) {
	// Debug: логируем данные
	React.useEffect(() => {
		console.log('UniversalBlockRenderer - data:', data);
		console.log('UniversalBlockRenderer - styles:', styles);
		console.log('UniversalBlockRenderer - viewportSize:', viewportSize);
	}, [data, styles, viewportSize]);

	// Функция для обработки переносов строк в тексте
	const formatTextWithLineBreaks = (text: any) => {
		if (!text || typeof text !== 'string') return text;

		const lines = text.split('\n');
		return lines.map((line, index) => (
			<React.Fragment key={index}>
				{line}
				{index < lines.length - 1 && <br />}
			</React.Fragment>
		));
	};

	const renderElement = (element: any, index = 0, repeatData: any = null, isRoot = false): React.ReactNode => {
		const { type, className = '', styles: elementStylesConfig = {}, children, dataKey, content, repeat, href, src, alt } = element;

		const elementStyles: React.CSSProperties = {};

		const numericProperties = [
			'width',
			'height',
			'maxWidth',
			'maxHeight',
			'minWidth',
			'minHeight',
			'padding',
			'paddingTop',
			'paddingRight',
			'paddingBottom',
			'paddingLeft',
			'margin',
			'marginTop',
			'marginRight',
			'marginBottom',
			'marginLeft',
			'borderWidth',
			'borderTopWidth',
			'borderRightWidth',
			'borderBottomWidth',
			'borderLeftWidth',
			'borderRadius',
			'borderTopLeftRadius',
			'borderTopRightRadius',
			'borderBottomLeftRadius',
			'borderBottomRightRadius',
			'fontSize',
			'lineHeight',
			'letterSpacing',
			'wordSpacing',
			'top',
			'right',
			'bottom',
			'left',
			'gap',
			'columnGap',
			'rowGap',
		];

		Object.entries(elementStylesConfig).forEach(([cssProperty, styleKey]) => {
			let value = styles[styleKey as string];
			if (value !== undefined && value !== null && value !== '') {
				if (numericProperties.includes(cssProperty) && !isNaN(value) && typeof value !== 'string') {
					value = `${value}px`;
				} else if (numericProperties.includes(cssProperty) && typeof value === 'string' && /^\d+$/.test(value)) {
					value = `${value}px`;
				}
				(elementStyles as any)[cssProperty] = value;
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
					<React.Fragment key={i}>{children.map((child: any, childIndex: number) => renderElement(child, i, currentData, false))}</React.Fragment>
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
			className: filteredClassName,
			style: elementStyles,
		};

		switch (type) {
			case 'container':
			case 'div':
				return (
					<div key={index} {...props}>
						{formatTextWithLineBreaks(textContent)}
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</div>
				);
			case 'grid':
				return (
					<div key={index} {...props}>{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}</div>
				);
			case 'h1':
				return <h1 key={index} {...props}>{formatTextWithLineBreaks(textContent)}</h1>;
			case 'h2':
				return <h2 key={index} {...props}>{formatTextWithLineBreaks(textContent)}</h2>;
			case 'h3':
				return <h3 key={index} {...props}>{formatTextWithLineBreaks(textContent)}</h3>;
			case 'h4':
				return <h4 key={index} {...props}>{formatTextWithLineBreaks(textContent)}</h4>;
			case 'h5':
				return <h5 key={index} {...props}>{formatTextWithLineBreaks(textContent)}</h5>;
			case 'h6':
				return <h6 key={index} {...props}>{formatTextWithLineBreaks(textContent)}</h6>;
			case 'p':
				return <p key={index} {...props}>{formatTextWithLineBreaks(textContent)}</p>;
			case 'span':
				return <span key={index} {...props}>{formatTextWithLineBreaks(textContent)}</span>;
			case 'a':
				return (
					<a key={index} {...props} href={href || data[element.hrefKey] || '#'}>
						{formatTextWithLineBreaks(textContent)}
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</a>
				);
			case 'img':
				let imgSrc = src;
				if (!imgSrc && element.srcKey) {
					if (repeatData && element.srcKey === '{{current}}') {
						imgSrc = repeatData;
					} else {
						imgSrc = data[element.srcKey] || '';
					}
				}
				// Не рендерим img если src пустой
				if (!imgSrc) return null;
				return <img key={index} {...props} src={imgSrc} alt={alt || data[element.altKey] || textContent || ''} />;
			case 'video':
				return (
					<video
						key={index}
						{...props}
						src={src || data[element.srcKey] || ''}
						controls={element.controls !== false}
						autoPlay={element.autoPlay || false}
						loop={element.loop || false}
						muted={element.muted || false}
						poster={element.poster || data[element.posterKey] || ''}
					>
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</video>
				);
			case 'audio':
				return (
					<audio
						key={index}
						{...props}
						src={src || data[element.srcKey] || ''}
						controls={element.controls !== false}
						autoPlay={element.autoPlay || false}
						loop={element.loop || false}
						muted={element.muted || false}
					>
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</audio>
				);
			case 'iframe':
				return (
					<iframe
						key={index}
						{...props}
						src={src || data[element.srcKey] || ''}
						title={element.title || data[element.titleKey] || ''}
						allowFullScreen={element.allowFullScreen || false}
					/>
				);
			case 'svg':
				return (
					<svg key={index} {...props} viewBox={element.viewBox || '0 0 100 100'} xmlns="http://www.w3.org/2000/svg">
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</svg>
				);
			case 'form':
				return (
					<form
						key={index}
						{...props}
						onSubmit={(e) => {
							if (element.preventDefault !== false) {
								e.preventDefault();
							}
						}}
						action={element.action || data[element.actionKey] || undefined}
						method={element.method || 'POST'}
					>
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</form>
				);
			case 'button':
				return (
					<button
						key={index}
						{...props}
						type={element.buttonType || 'button'}
					>
						{formatTextWithLineBreaks(textContent)}
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</button>
				);
			case 'ul':
				return <ul key={index} {...props}>{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}</ul>;
			case 'ol':
				return <ol key={index} {...props}>{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}</ol>;
			case 'li':
				return (
					<li key={index} {...props}>
						{formatTextWithLineBreaks(textContent)}
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</li>
				);
			case 'strong':
				return <strong key={index} {...props}>{formatTextWithLineBreaks(textContent)}</strong>;
			case 'em':
				return <em key={index} {...props}>{formatTextWithLineBreaks(textContent)}</em>;
			case 'small':
				return <small key={index} {...props}>{formatTextWithLineBreaks(textContent)}</small>;
			case 'br':
				return <br key={index} {...props} />;
			case 'hr':
				return <hr key={index} {...props} />;
			case 'label':
				return (
					<label
						key={index}
						{...props}
						htmlFor={element.htmlFor || element.for || ''}
					>
						{formatTextWithLineBreaks(textContent)}
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</label>
				);
			case 'input':
				return (
					<input
						key={index}
						{...props}
						type={element.inputType || element.type || 'text'}
						name={element.name || ''}
						id={element.id || ''}
						placeholder={element.placeholder || data[element.placeholderKey] || ''}
						defaultValue={element.value || data[element.valueKey] || ''}
						required={element.required || false}
						disabled={element.disabled || false}
						readOnly={element.readOnly || false}
						min={element.min}
						max={element.max}
						step={element.step}
						pattern={element.pattern}
						maxLength={element.maxLength}
						minLength={element.minLength}
					/>
				);
			case 'textarea':
				return (
					<textarea
						key={index}
						{...props}
						name={element.name || ''}
						id={element.id || ''}
						placeholder={element.placeholder || data[element.placeholderKey] || ''}
						defaultValue={element.value || data[element.valueKey] || ''}
						required={element.required || false}
						disabled={element.disabled || false}
						readOnly={element.readOnly || false}
						rows={element.rows || 4}
						cols={element.cols}
						maxLength={element.maxLength}
						minLength={element.minLength}
					/>
				);
			case 'select':
				return (
					<select
						key={index}
						{...props}
						name={element.name || ''}
						id={element.id || ''}
						required={element.required || false}
						disabled={element.disabled || false}
						multiple={element.multiple || false}
						defaultValue={element.value || data[element.valueKey] || ''}
					>
						{children && children.map((child: any, i: number) => renderElement(child, i, repeatData, false))}
					</select>
				);
			case 'option':
				return (
					<option
						key={index}
						{...props}
						value={element.value || textContent}
						selected={element.selected || false}
						disabled={element.disabled || false}
					>
						{formatTextWithLineBreaks(textContent)}
					</option>
				);
			default:
				return <div key={index} {...props}>{formatTextWithLineBreaks(textContent)}</div>;
		}
	};

	return <>{structure.map((element, index) => renderElement(element, index, null, true))}</>;
}
