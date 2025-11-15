import React from "react";


export default function ElementRenderer({ element, typeConfig }) {
  const { type_name, props = {} } = element;

  // Базовые типы с кастомным рендерингом
  if (type_name === "text") {
    return (
      <div
        style={{
          color: props.color,
          fontFamily: props.fontFamily,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          textAlign: props.textAlign,
          lineHeight: props.lineHeight,
          letterSpacing: props.letterSpacing,
          textTransform: props.textTransform,
          transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
        }}
      >
        {props.content}
      </div>
    );
  }

  if (type_name === "button") {
    return (
      <button
        style={{
          color: props.color,
          backgroundColor: props.backgroundColor,
          fontFamily: props.fontFamily,
          fontSize: props.fontSize,
          fontWeight: props.fontWeight,
          transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
          lineHeight: props.lineHeight,
          letterSpacing: props.letterSpacing,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          borderColor: props.borderColor,
          textAlign: props.textAlign || "center",
          borderRadius: element.borderRadius,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {props.content}
      </button>
    );
  }

  if (type_name === "image") {
    return (
      <div className="overflow-hidden w-full h-full">
        <img
          src={props.src === "" ? "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg" : props.src}
          alt=""
          className="w-full h-full pointer-events-none select-none"
          style={{
            transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
            scale: props.scale || 1,
            objectFit: props.objectFit || "contain",
            borderColor: props.borderColor,
            borderWidth: props.borderWidth,
            borderStyle: props.borderStyle,
            borderRadius: element.borderRadius,
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
    );
  }

  if (type_name === "block") {
    return (
      <div
        className="overfow-hidden w-full h-full"
        style={{
          transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
          borderColor: props.borderColor,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          borderRadius: element.borderRadius,
          backgroundColor: props.backgroundColor,
        }}
      />
    );
  }

  if (type_name === "video") {
    return (
      <video
        src={props.src}
        className="w-full h-full"
        autoPlay={props.autoPlay === "Нет" ? false : props.autoPlay === "Да" ? true : false}
        controls={props.controls === "Скрыть" ? false : props.controls === "Показать" ? true : false}
        poster={props.preview_status === "Да" && props.preview ? props.preview : ""}
        loop={props.loop === "Нет" ? false : props.loop === "Да" ? true : false}
        muted={props.muted === "Нет" ? false : props.muted === "Да" ? true : false}
        style={{
          objectFit: props.objectFit,
          transform: props.rotation ? `rotate(${props.rotation}deg)` : undefined,
          borderColor: props.borderColor,
          borderWidth: props.borderWidth,
          borderStyle: props.borderStyle,
          borderRadius: element.borderRadius,
        }}
      />
    )
  }

  // Для кастомных типов с children
  if (props.children && Array.isArray(props.children)) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        {props.children.map((child, index) => (
          <div
            key={index}
            style={{
              width: child.width || "100%",
              height: child.height || "auto",
              backgroundColor: child.backgroundColor || "transparent",
              color: child.color || "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
              borderRadius: "4px",
            }}
          >
            {child.type === "input" ? (
              <input
                type="text"
                placeholder={child.placeholder}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  color: "inherit",
                }}
              />
            ) : child.type === "button" ? (
              <button
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                {child.placeholder || "Кнопка"}
              </button>
            ) : (
              <span>{child.placeholder || ""}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Дефолтный рендеринг для неизвестных типов
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        color: "#999",
      }}
    >
      {type_name}
    </div>
  );
}
