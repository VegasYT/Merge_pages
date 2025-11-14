// Mock данные для категорий, шаблонов блоков и блоков страницы

export const mockCategories = [
  { id: 1, name: 'Заголовки' },
  { id: 2, name: 'Контент' },
  { id: 3, name: 'Галереи' },
  { id: 4, name: 'Кастомные' }
];

export const mockBlockTemplates = [
  {
    "id": 4,
    "category_id": 2,
    "template_name": "HeroWithVideo",
    "name": "Герой с видео фоном",
    "preview_url": "https://via.placeholder.com/300x200/1a202c/ffffff?text=Hero+Video",
    "settings": {
      "structure": [
        {
          "type": "container",
          "className": "relative overflow-hidden py-20 sm:py-24 md:py-32 lg:py-40",
          "styles": {
            "backgroundColor": "overlayColor"
          },
          "children": [
            {
              "type": "video",
              "srcKey": "backgroundVideo",
              "posterKey": "videoPoster",
              "className": "absolute inset-0 w-full h-full object-cover",
              "styles": {
                "opacity": "videoOpacity"
              },
              "autoPlay": true,
              "loop": true,
              "muted": true,
              "controls": false
            },
            {
              "type": "container",
              "className": "relative z-10 max-w-4xl mx-auto px-4 text-center sm:px-6",
              "children": [
                {
                  "type": "h1",
                  "dataKey": "title",
                  "className": "text-4xl font-bold mb-6 sm:text-5xl md:text-6xl lg:text-7xl",
                  "styles": {
                    "color": "titleColor"
                  }
                },
                {
                  "type": "p",
                  "dataKey": "subtitle",
                  "className": "text-lg mb-8 sm:text-xl md:text-2xl",
                  "styles": {
                    "color": "subtitleColor"
                  }
                },
                {
                  "type": "button",
                  "dataKey": "ctaButton",
                  "className": "text-lg font-semibold transition transform hover:scale-105 shadow-lg",
                  "styles": {
                    "backgroundColor": "buttonColor",
                    "color": "buttonTextColor",
                    "borderRadius": "buttonBorderRadius",
                    "padding": "buttonPadding"
                  }
                }
              ]
            }
          ]
        }
      ],
      "editableElements": ["backgroundVideo", "videoPoster", "title", "subtitle", "ctaButton"],
      "editableStyles": {
        "overlayColor": {
          "type": "color",
          "label": "Цвет оверлея",
          "default": "rgba(0, 0, 0, 0.5)"
        },
        "videoOpacity": {
          "type": "range",
          "label": "Прозрачность видео",
          "default": 0.6,
          "min": 0,
          "max": 1,
          "step": 0.1
        },
        "titleColor": {
          "type": "color",
          "label": "Цвет заголовка",
          "default": "#ffffff"
        },
        "subtitleColor": {
          "type": "color",
          "label": "Цвет подзаголовка",
          "default": "#e2e8f0"
        },
        "buttonColor": {
          "type": "color",
          "label": "Цвет кнопки",
          "default": "#f56565"
        },
        "buttonTextColor": {
          "type": "color",
          "label": "Цвет текста кнопки",
          "default": "#ffffff"
        },
        "buttonBorderRadius": {
          "type": "number",
          "label": "Скругление кнопки",
          "default": 50,
          "min": 0,
          "max": 50,
          "step": 1,
          "unit": "px"
        },
        "buttonPadding": {
          "type": "text",
          "label": "Отступы кнопки",
          "default": "16px 48px"
        }
      }
    },
    "default_data": {
      "backgroundVideo": "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
      "videoPoster": "https://via.placeholder.com/1920x1080/1a202c/ffffff",
      "title": "Создавайте невероятные проекты",
      "subtitle": "Профессиональные инструменты для воплощения ваших идей",
      "ctaButton": "Начать сейчас"
    }
  },
  {
    "id": 5,
    "category_id": 3,
    "template_name": "ImageGallery",
    "name": "Галерея изображений",
    "preview_url": "https://via.placeholder.com/300x200/805ad5/ffffff?text=Gallery",
    "settings": {
      "structure": [
        {
          "type": "container",
          "className": "py-16 sm:py-20 md:py-24",
          "styles": {
            "backgroundColor": "backgroundColor"
          },
          "children": [
            {
              "type": "container",
              "className": "max-w-7xl mx-auto px-4 sm:px-6",
              "children": [
                {
                  "type": "h2",
                  "dataKey": "title",
                  "className": "text-3xl font-bold text-center mb-4 sm:text-4xl md:text-5xl",
                  "styles": {
                    "color": "titleColor"
                  }
                },
                {
                  "type": "p",
                  "dataKey": "description",
                  "className": "text-lg text-center mb-12 sm:text-xl md:mb-16",
                  "styles": {
                    "color": "descriptionColor"
                  }
                },
                {
                  "type": "grid",
                  "className": "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8",
                  "repeat": {
                    "count": 6,
                    "dataKeys": ["image1", "image2", "image3", "image4", "image5", "image6"]
                  },
                  "children": [
                    {
                      "type": "container",
                      "className": "group relative overflow-hidden transition-transform hover:scale-105",
                      "styles": {
                        "borderRadius": "cardBorderRadius"
                      },
                      "children": [
                        {
                          "type": "img",
                          "srcKey": "{{current}}",
                          "alt": "Gallery image",
                          "className": "w-full h-64 object-cover sm:h-72 md:h-80",
                          "styles": {}
                        },
                        {
                          "type": "container",
                          "className": "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center",
                          "children": [
                            {
                              "type": "span",
                              "content": "Просмотр",
                              "className": "text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "editableElements": ["title", "description", "image1", "image2", "image3", "image4", "image5", "image6"],
      "editableStyles": {
        "backgroundColor": {
          "type": "color",
          "label": "Цвет фона",
          "default": "#f7fafc"
        },
        "titleColor": {
          "type": "color",
          "label": "Цвет заголовка",
          "default": "#1a202c"
        },
        "descriptionColor": {
          "type": "color",
          "label": "Цвет описания",
          "default": "#4a5568"
        },
        "cardBorderRadius": {
          "type": "number",
          "label": "Скругление карточек",
          "default": 12,
          "min": 0,
          "max": 30,
          "step": 2,
          "unit": "px"
        }
      }
    },
    "default_data": {
      "title": "Наши работы",
      "description": "Проекты, которыми мы гордимся",
      "image1": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=500&fit=crop",
      "image2": "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=500&h=500&fit=crop",
      "image3": "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=500&h=500&fit=crop",
      "image4": "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=500&h=500&fit=crop",
      "image5": "https://images.unsplash.com/photo-1617817546714-e6ae8db0c9d0?w=500&h=500&fit=crop",
      "styles": {
        "backgroundColor": "#f7fafc",
        "titleColor": "#1a202c",
        "descriptionColor": "#4a5568",
        "cardBorderRadius": 12
      }
    }
  },
  {
    "id": 6,
    "category_id": 2,
    "template_name": "ContentWithImage",
    "name": "Контент с изображением",
    "preview_url": "https://via.placeholder.com/300x200/48bb78/ffffff?text=Content+Image",
    "settings": {
      "structure": [
        {
          "type": "container",
          "className": "py-16 sm:py-20 md:py-24",
          "styles": {
            "backgroundColor": "backgroundColor"
          },
          "children": [
            {
              "type": "container",
              "className": "max-w-7xl mx-auto px-4 sm:px-6",
              "children": [
                {
                  "type": "grid",
                  "className": "grid grid-cols-1 gap-12 items-center lg:grid-cols-2 lg:gap-16",
                  "children": [
                    {
                      "type": "container",
                      "className": "order-2 lg:order-1",
                      "children": [
                        {
                          "type": "span",
                          "dataKey": "badge",
                          "className": "inline-block text-sm font-semibold mb-4 px-4 py-2 rounded-full",
                          "styles": {
                            "backgroundColor": "badgeColor",
                            "color": "badgeTextColor"
                          }
                        },
                        {
                          "type": "h2",
                          "dataKey": "title",
                          "className": "text-3xl font-bold mb-6 sm:text-4xl md:text-5xl",
                          "styles": {
                            "color": "titleColor"
                          }
                        },
                        {
                          "type": "p",
                          "dataKey": "description",
                          "className": "text-lg mb-6 leading-relaxed sm:text-xl",
                          "styles": {
                            "color": "textColor"
                          }
                        },
                        {
                          "type": "ul",
                          "className": "space-y-3 mb-8",
                          "repeat": {
                            "count": 3,
                            "dataKeys": ["feature1", "feature2", "feature3"]
                          },
                          "children": [
                            {
                              "type": "li",
                              "className": "flex items-start",
                              "children": [
                                {
                                  "type": "span",
                                  "content": "✓",
                                  "className": "text-2xl mr-3 font-bold",
                                  "styles": {
                                    "color": "checkmarkColor"
                                  }
                                },
                                {
                                  "type": "span",
                                  "dataKey": "{{current}}",
                                  "className": "text-lg",
                                  "styles": {
                                    "color": "textColor"
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          "type": "button",
                          "dataKey": "buttonText",
                          "className": "text-base font-semibold transition-all hover:shadow-xl",
                          "styles": {
                            "backgroundColor": "buttonColor",
                            "color": "buttonTextColor",
                            "borderRadius": "buttonBorderRadius",
                            "padding": "buttonPadding"
                          }
                        }
                      ]
                    },
                    {
                      "type": "container",
                      "className": "order-1 lg:order-2 relative",
                      "children": [
                        {
                          "type": "img",
                          "srcKey": "mainImage",
                          "altKey": "imageAlt",
                          "className": "w-full h-auto shadow-2xl",
                          "styles": {
                            "borderRadius": "imageBorderRadius"
                          }
                        },
                        {
                          "type": "container",
                          "className": "absolute -bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48",
                          "styles": {
                            "backgroundColor": "accentColor",
                            "borderRadius": "accentBorderRadius",
                            "opacity": "accentOpacity"
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "editableElements": ["badge", "title", "description", "feature1", "feature2", "feature3", "buttonText", "mainImage", "imageAlt"],
      "editableStyles": {
        "backgroundColor": {
          "type": "color",
          "label": "Цвет фона",
          "default": "#ffffff"
        },
        "badgeColor": {
          "type": "color",
          "label": "Цвет бейджа",
          "default": "#edf2f7"
        },
        "badgeTextColor": {
          "type": "color",
          "label": "Цвет текста бейджа",
          "default": "#4299e1"
        },
        "titleColor": {
          "type": "color",
          "label": "Цвет заголовка",
          "default": "#1a202c"
        },
        "textColor": {
          "type": "color",
          "label": "Цвет текста",
          "default": "#4a5568"
        },
        "checkmarkColor": {
          "type": "color",
          "label": "Цвет галочек",
          "default": "#48bb78"
        },
        "buttonColor": {
          "type": "color",
          "label": "Цвет кнопки",
          "default": "#4299e1"
        },
        "buttonTextColor": {
          "type": "color",
          "label": "Цвет текста кнопки",
          "default": "#ffffff"
        },
        "buttonBorderRadius": {
          "type": "number",
          "label": "Скругление кнопки",
          "default": 8,
          "min": 0,
          "max": 50,
          "step": 2,
          "unit": "px"
        },
        "buttonPadding": {
          "type": "text",
          "label": "Отступы кнопки",
          "default": "14px 32px"
        },
        "imageBorderRadius": {
          "type": "number",
          "label": "Скругление изображения",
          "default": 16,
          "min": 0,
          "max": 30,
          "step": 2,
          "unit": "px"
        },
        "accentColor": {
          "type": "color",
          "label": "Акцентный цвет",
          "default": "#4299e1"
        },
        "accentBorderRadius": {
          "type": "number",
          "label": "Скругление акцента",
          "default": 16,
          "min": 0,
          "max": 50,
          "step": 2,
          "unit": "px"
        },
        "accentOpacity": {
          "type": "range",
          "label": "Прозрачность акцента",
          "default": 0.2,
          "min": 0,
          "max": 1,
          "step": 0.1
        }
      }
    },
    "default_data": {
      "badge": "НОВИНКА",
      "title": "Революционное решение для вашего бизнеса",
      "description": "Мы создали инструмент, который поможет вам достичь невероятных результатов. Простота использования сочетается с мощными возможностями.",
      "feature1": "Интуитивный интерфейс для быстрой работы",
      "feature2": "Автоматизация рутинных процессов",
      "feature3": "Аналитика и отчёты в реальном времени",
      "buttonText": "Узнать больше",
      "mainImage": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop",
      "imageAlt": "Современный офис с технологиями"
    }
  },
  {
    "id": 7,
    "category_id": 2,
    "template_name": "VideoShowcase",
    "name": "Видео презентация",
    "preview_url": "https://via.placeholder.com/300x200/9f7aea/ffffff?text=Video+Showcase",
    "settings": {
      "structure": [
        {
          "type": "container",
          "className": "py-16 sm:py-20 md:py-24 lg:py-32",
          "styles": {
            "backgroundColor": "backgroundColor"
          },
          "children": [
            {
              "type": "container",
              "className": "max-w-6xl mx-auto px-4 sm:px-6",
              "children": [
                {
                  "type": "container",
                  "className": "text-center mb-12 md:mb-16",
                  "children": [
                    {
                      "type": "h2",
                      "dataKey": "title",
                      "className": "text-3xl font-bold mb-4 sm:text-4xl md:text-5xl",
                      "styles": {
                        "color": "titleColor"
                      }
                    },
                    {
                      "type": "p",
                      "dataKey": "subtitle",
                      "className": "text-lg sm:text-xl",
                      "styles": {
                        "color": "subtitleColor"
                      }
                    }
                  ]
                },
                {
                  "type": "container",
                  "className": "relative shadow-2xl",
                  "styles": {
                    "borderRadius": "videoBorderRadius"
                  },
                  "children": [
                    {
                      "type": "video",
                      "srcKey": "videoUrl",
                      "posterKey": "videoPoster",
                      "className": "w-full",
                      "styles": {
                        "borderRadius": "videoBorderRadius"
                      },
                      "controls": true,
                      "loop": false,
                      "muted": false
                    }
                  ]
                },
                {
                  "type": "grid",
                  "className": "grid grid-cols-1 gap-6 mt-12 sm:grid-cols-3 md:gap-8 md:mt-16",
                  "repeat": {
                    "count": 3,
                    "dataKeys": ["stat1", "stat2", "stat3"]
                  },
                  "children": [
                    {
                      "type": "container",
                      "className": "text-center p-6 rounded-lg",
                      "styles": {
                        "backgroundColor": "cardColor"
                      },
                      "children": [
                        {
                          "type": "div",
                          "className": "text-4xl font-bold mb-2 sm:text-5xl",
                          "styles": {
                            "color": "statNumberColor"
                          },
                          "content": "{{index}}"
                        },
                        {
                          "type": "p",
                          "dataKey": "{{current}}",
                          "className": "text-base sm:text-lg",
                          "styles": {
                            "color": "statTextColor"
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "editableElements": ["title", "subtitle", "videoUrl", "videoPoster", "stat1", "stat2", "stat3"],
      "editableStyles": {
        "backgroundColor": {
          "type": "color",
          "label": "Цвет фона",
          "default": "#f7fafc"
        },
        "titleColor": {
          "type": "color",
          "label": "Цвет заголовка",
          "default": "#1a202c"
        },
        "subtitleColor": {
          "type": "color",
          "label": "Цвет подзаголовка",
          "default": "#4a5568"
        },
        "videoBorderRadius": {
          "type": "number",
          "label": "Скругление видео",
          "default": 16,
          "min": 0,
          "max": 30,
          "step": 2,
          "unit": "px"
        },
        "cardColor": {
          "type": "color",
          "label": "Цвет карточек",
          "default": "#ffffff"
        },
        "statNumberColor": {
          "type": "color",
          "label": "Цвет цифр статистики",
          "default": "#9f7aea"
        },
        "statTextColor": {
          "type": "color",
          "label": "Цвет текста статистики",
          "default": "#4a5568"
        }
      }
    },
    "default_data": {
      "title": "Посмотрите, как это работает",
      "subtitle": "Короткая демонстрация наших возможностей",
      "videoUrl": "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-4923-large.mp4",
      "videoPoster": "https://via.placeholder.com/1200x675/9f7aea/ffffff",
      "stat1": "Довольных клиентов",
      "stat2": "Завершённых проектов",
      "stat3": "Лет опыта"
    }
  },
  {
    "id": 8,
    "category_id": 4,
    "template_name": "HtmlBlock",
    "name": "HTML блок",
    "preview_url": "https://via.placeholder.com/300x200/38b2ac/ffffff?text=HTML+Block",
    "settings": {
      "type": "html",
      "editableElements": ["htmlContent"]
    },
    "default_data": {
      "htmlContent": "<div style=\"padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;\">\n  <h2 style=\"margin: 0 0 20px 0; font-size: 32px;\">Кастомный HTML блок</h2>\n  <p style=\"margin: 0; font-size: 18px;\">Здесь вы можете добавить любой HTML код</p>\n</div>"
    }
  }
]

// Моковые данные для зероблока с responsive настройками
export const mockZeroblock = {
  // Базовые данные блока
  block: {
    id: 1,
    page_id: 1,
    block_template_id: null,
    type: 'zeroblock',
    position: 0,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Зероблок
  zeroBlock: {
    id: 1,
    block_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Типы базовых элементов
  zeroBaseElements: [
    {
      id: 1,
      type_name: 'text',
      display_name: 'Текст',
      icon: 'Type',
      schema: {
        props: {
          content: { type: 'textarea', default: 'Текст' },
          color: { type: 'color', default: '#000000' },
          fontSize: { type: 'range', min: 12, max: 72, default: 24 },
          fontWeight: { type: 'select', default: 'normal' }
        }
      },
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      type_name: 'block',
      display_name: 'Блок',
      icon: 'Square',
      schema: {
        props: {
          backgroundColor: { type: 'color', default: '#ff740f' }
        }
      },
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      type_name: 'image',
      display_name: 'Изображение',
      icon: 'Image',
      schema: {
        props: {
          src: { type: 'upload', default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' }
        }
      },
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      type_name: 'button',
      display_name: 'Кнопка',
      icon: 'MousePointerSquareDashed',
      schema: {
        props: {
          content: { type: 'string', default: 'Кнопка' },
          backgroundColor: { type: 'color', default: '#ff740f' },
          color: { type: 'color', default: '#ffffff' }
        }
      },
      created_at: new Date().toISOString()
    }
  ],

  // Responsive настройки зероблока (аналог брейкпоинтов)
  zeroBlockResponsive: [
    {
      id: 1,
      zero_block_id: 1,
      height: 600,
      width: 1920,
      props: { name: 'Desktop', isDefault: true },
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      zero_block_id: 1,
      height: 1024,
      width: 768,
      props: { name: 'Tablet' },
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      zero_block_id: 1,
      height: 667,
      width: 375,
      props: { name: 'Mobile' },
      created_at: new Date().toISOString()
    }
  ],

  // Слои (элементы) - data используется для других целей, НЕ для props
  zeroLayers: [
    {
      id: 1,
      zeroblock_id: 1,
      zero_base_element_id: 1, // text
      data: {}, // Может содержать метаданные, настройки анимации и т.д.
      position: 0
    },
    {
      id: 2,
      zeroblock_id: 1,
      zero_base_element_id: 2, // block
      data: {},
      position: 1
    },
    {
      id: 3,
      zeroblock_id: 1,
      zero_base_element_id: 4, // button
      data: {},
      position: 2
    }
  ],

  // Responsive настройки для каждого слоя - ВСЕ PROPS ЗДЕСЬ!
  zeroLayerResponsive: [
    // Desktop (responsive_id: 1) - текст
    {
      id: 1,
      zero_layer_id: 1,
      zero_block_responsive_id: 1,
      x: 100,
      y: 50,
      width: 600,
      height: 80,
      direction: 'horizontal',
      data: {
        props: {
          content: 'Добро пожаловать!',
          color: '#ffffff',
          fontSize: 48,
          fontWeight: 'bold'
        }
      },
      created_at: new Date().toISOString()
    },
    // Tablet (responsive_id: 2) - текст
    {
      id: 2,
      zero_layer_id: 1,
      zero_block_responsive_id: 2,
      x: 50,
      y: 40,
      width: 400,
      height: 70,
      direction: 'horizontal',
      data: {
        props: {
          content: 'Добро пожаловать!',
          color: '#ffffff',
          fontSize: 36, // меньше шрифт на планшете
          fontWeight: 'bold'
        }
      },
      created_at: new Date().toISOString()
    },
    // Mobile (responsive_id: 3) - текст
    {
      id: 3,
      zero_layer_id: 1,
      zero_block_responsive_id: 3,
      x: 20,
      y: 30,
      width: 335,
      height: 60,
      direction: 'horizontal',
      data: {
        props: {
          content: 'Привет!', // Другой контент на мобильном
          color: '#ffffff',
          fontSize: 28, // еще меньше на мобильном
          fontWeight: 'bold'
        }
      },
      created_at: new Date().toISOString()
    },

    // Desktop (responsive_id: 1) - блок
    {
      id: 4,
      zero_layer_id: 2,
      zero_block_responsive_id: 1,
      x: 0,
      y: 0,
      width: 1920,
      height: 600,
      direction: 'horizontal',
      data: {
        props: {
          backgroundColor: '#4299e1'
        }
      },
      created_at: new Date().toISOString()
    },
    // Tablet (responsive_id: 2) - блок
    {
      id: 5,
      zero_layer_id: 2,
      zero_block_responsive_id: 2,
      x: 0,
      y: 0,
      width: 768,
      height: 1024,
      direction: 'vertical',
      data: {
        props: {
          backgroundColor: '#4299e1'
        }
      },
      created_at: new Date().toISOString()
    },
    // Mobile (responsive_id: 3) - блок
    {
      id: 6,
      zero_layer_id: 2,
      zero_block_responsive_id: 3,
      x: 0,
      y: 0,
      width: 375,
      height: 667,
      direction: 'vertical',
      data: {
        props: {
          backgroundColor: '#4299e1'
        }
      },
      created_at: new Date().toISOString()
    },

    // Desktop (responsive_id: 1) - кнопка
    {
      id: 7,
      zero_layer_id: 3,
      zero_block_responsive_id: 1,
      x: 100,
      y: 200,
      width: 200,
      height: 60,
      direction: 'horizontal',
      data: {
        props: {
          content: 'Начать',
          backgroundColor: '#48bb78',
          color: '#ffffff'
        }
      },
      created_at: new Date().toISOString()
    },
    // Tablet (responsive_id: 2) - кнопка
    {
      id: 8,
      zero_layer_id: 3,
      zero_block_responsive_id: 2,
      x: 50,
      y: 150,
      width: 180,
      height: 55,
      direction: 'horizontal',
      data: {
        props: {
          content: 'Начать',
          backgroundColor: '#48bb78',
          color: '#ffffff'
        }
      },
      created_at: new Date().toISOString()
    },
    // Mobile (responsive_id: 3) - кнопка
    {
      id: 9,
      zero_layer_id: 3,
      zero_block_responsive_id: 3,
      x: 20,
      y: 120,
      width: 335,
      height: 50,
      direction: 'horizontal',
      data: {
        props: {
          content: 'Поехали!', // Другой текст на мобильном
          backgroundColor: '#48bb78',
          color: '#ffffff'
        }
      },
      created_at: new Date().toISOString()
    }
  ]
};

// Добавляем зероблок в список блоков
export const mockBlocks = [
  {
    id: 1,
    page_id: 1,
    block_template_id: null,
    type: 'zeroblock',
    position: 0,
    settings: {
      zeroblockId: 1 // ссылка на mockZeroblock
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
