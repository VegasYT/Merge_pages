// Конфигурация базовых типов элементов
// Эти схемы повторяют структуру из базы данных

export const BASE_ELEMENT_TYPES = {
  text: {
    id: 1,
    type_name: "text",
    displayName: "Текст",
    icon: "Type",
    schema: {
      props: {
        content: {
          label: "Текст",
          type: "textarea",
          default: "Текст"
        },
        color: {
          label: "Цвет текста",
          type: "color",
          default: "#000000"
        },
        fontSize: {
          label: "Размер шрифта",
          type: "range",
          min: 12,
          max: 72,
          default: 24
        },
        fontWeight: {
          label: "Начертание",
          type: "select",
          options: [
            { value: "normal", label: "Обычный" },
            { value: "bold", label: "Жирный" },
            { value: "bolder", label: "Очень жирный" },
            { value: "lighter", label: "Тонкий" }
          ],
          default: "normal"
        },
        textAlign: {
          label: "Выравнивание",
          type: "select",
          options: [
            { value: "left", label: "Слева" },
            { value: "center", label: "По центру" },
            { value: "right", label: "Справа" }
          ],
          default: "center"
        }
      }
    },
    // Базовые размеры при создании
    defaultSize: { width: 200, height: 50 }
  },

  block: {
    id: 2,
    type_name: "block",
    displayName: "Блок",
    icon: "Square",
    schema: {
      props: {
        backgroundColor: {
          label: "Цвет фона",
          type: "color",
          default: "#ff740f"
        }
      }
    },
    defaultSize: { width: 150, height: 150 }
  },

  image: {
    id: 3,
    type_name: "image",
    displayName: "Изображение",
    icon: "Image",
    schema: {
      props: {
        src: {
          label: "Изображение",
          type: "upload",
          default: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
          placeholder: "https://..."
        }
      }
    },
    defaultSize: { width: 150, height: 150 }
  },

  button: {
    id: 4,
    type_name: "button",
    displayName: "Кнопка",
    icon: "MousePointerSquareDashed",
    schema: {
      props: {
        buttonText: {
          label: "Текст кнопки",
          type: "string",
          default: "Кнопка"
        },
        backgroundColor: {
          label: "Цвет фона",
          type: "color",
          default: "#ff740f"
        },
        color: {
          label: "Цвет текста",
          type: "color",
          default: "#ffffff"
        },
        fontSize: {
          label: "Размер шрифта",
          type: "range",
          min: 12,
          max: 48,
          default: 24
        }
      }
    },
    defaultSize: { width: 150, height: 50 },
    defaultProps: { borderRadius: 8 }
  },

  // Пример кастомного типа с children
  forms: {
    id: 5,
    type_name: "forms",
    displayName: "Форма",
    icon: "Square",
    schema: {
      props: {
        backgroundColor: {
          label: "Цвет фона",
          type: "color",
          default: "#ffffff"
        },
        children: {
          label: "Элементы формы",
          type: "array",
          itemProps: {
            type: {
              label: "Тип элемента",
              type: "select",
              options: [
                { value: "input", label: "Поле ввода" },
                { value: "button", label: "Кнопка" }
              ],
              default: "input"
            },
            placeholder: {
              label: "Placeholder / текст",
              type: "string",
              default: ""
            },
            color: {
              label: "Цвет текста",
              type: "color",
              default: "#000000"
            },
            backgroundColor: {
              label: "Цвет фона",
              type: "color",
              default: "#f3f4f6"
            },
            width: {
              label: "Ширина",
              type: "number",
              default: 100
            },
            height: {
              label: "Высота",
              type: "number",
              default: 40
            }
          },
          default: [
            {
              type: "input",
              placeholder: "Email",
              color: "#000000",
              backgroundColor: "#f3f4f6",
              width: 100,
              height: 40
            },
            {
              type: "button",
              placeholder: "Отправить",
              color: "#ffffff",
              backgroundColor: "#ff740f",
              width: 100,
              height: 40
            }
          ]
        }
      }
    },
    defaultSize: { width: 300, height: 200 }
  }
};

// Общие свойства для всех элементов
export const COMMON_PROPS_SCHEMA = {
  border: {
    label: "Рамка",
    type: "string",
    default: "1px solid #e5e7eb",
    placeholder: "1px solid #000000"
  },
  borderRadius: {
    label: "Скругление углов",
    type: "range",
    min: 0,
    max: 50,
    step: 1,
    default: 0
  },
  opacity: {
    label: "Прозрачность",
    type: "range",
    min: 0,
    max: 1,
    step: 0.1,
    default: 1
  },
  x: {
    label: "X",
    type: "number",
    default: 50
  },
  y: {
    label: "Y",
    type: "number",
    default: 50
  },
  width: {
    label: "Ширина",
    type: "number",
    default: 150
  },
  height: {
    label: "Высота",
    type: "number",
    default: 150
  }
};
