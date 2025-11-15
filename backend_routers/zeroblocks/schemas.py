from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator


# ==================== ZeroBaseElement Schemas ====================

class ZeroBaseElementCreate(BaseModel):
    """Схема для создания базового элемента"""

    type_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Название типа элемента (text, button, image и т.д.)"
    )
    display_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Отображаемое название элемента (Текст, Кнопка, ...)"
    )
    icon : str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Иконка (Square, Image, ...)"
    )
    schema: Dict[str, Any] = Field(
        ...,
        description="JSON схема элемента с описанием его свойств"
    )


class ZeroBaseElementResponse(BaseModel):
    """Схема ответа с данными базового элемента"""

    id: int
    type_name: str
    display_name: str
    icon: str
    schema: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== ZeroBlock Schemas ====================

class ZeroBlockCreate(BaseModel):
    """Схема для создания zero-блока"""
    pass


class ZeroBlockUpdate(BaseModel):
    """Схема для обновления zero-блока"""
    pass


class ZeroBlockResponse(BaseModel):
    """Схема ответа с данными zero-блока"""

    id: int
    block_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== ZeroLayer Schemas ====================

class ZeroLayerCreate(BaseModel):
    """Схема для создания слоя"""

    zero_base_element_id: int = Field(
        ...,
        description="ID базового элемента"
    )
    data: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Данные элемента"
    )
    position: int = Field(
        default=0,
        ge=0,
        description="Позиция слоя (z-index)"
    )


class ZeroLayerUpdate(BaseModel):
    """Схема для обновления слоя"""

    zero_base_element_id: Optional[int] = Field(
        None,
        description="ID базового элемента"
    )
    data: Optional[Dict[str, Any]] = Field(
        None,
        description="Данные элемента"
    )


class ZeroLayerPositionUpdate(BaseModel):
    """Схема для обновления позиции слоя"""

    position: int = Field(
        ...,
        ge=0,
        description="Новая позиция слоя"
    )


class ZeroLayerResponse(BaseModel):
    """Схема ответа с данными слоя"""

    id: int
    zero_block_id: int
    zero_base_element_id: int
    data: Optional[Dict[str, Any]]
    position: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== ZeroBlockResponsive Schemas ====================

class ZeroBlockResponsiveCreate(BaseModel):
    """Схема для создания адаптивных настроек блока"""

    zero_block_id: int = Field(
        ...,
        description="ID zero-блока"
    )
    width: int = Field(
        ...,
        gt=0,
        description="Ширина экрана (breakpoint в пикселях)"
    )
    height: Optional[int] = Field(
        None,
        ge=0,
        description="Высота блока в пикселях"
    )
    props: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Дополнительные свойства (background, grid_settings и т.д.)"
    )


class ZeroBlockResponsiveUpdate(BaseModel):
    """Схема для обновления адаптивных настроек блока"""

    width: Optional[int] = Field(
        None,
        gt=0,
        description="Ширина экрана (breakpoint в пикселях)"
    )
    height: Optional[int] = Field(
        None,
        ge=0,
        description="Высота блока в пикселях"
    )
    props: Optional[Dict[str, Any]] = Field(
        None,
        description="Дополнительные свойства"
    )


class ZeroBlockResponsiveResponse(BaseModel):
    """Схема ответа с адаптивными настройками блока"""

    id: int
    zero_block_id: int
    width: int
    height: Optional[int]
    props: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== ZeroLayerResponsive Schemas ====================

class ZeroLayerResponsiveCreate(BaseModel):
    """Схема для создания адаптивных настроек слоя"""

    zero_block_responsive_id: int = Field(
        ...,
        description="ID адаптивных настроек блока"
    )
    x: Optional[int] = Field(
        0,
        description="Позиция по оси X"
    )
    y: Optional[int] = Field(
        0,
        description="Позиция по оси Y"
    )
    width: Optional[int] = Field(
        None,
        ge=0,
        description="Ширина элемента"
    )
    height: Optional[int] = Field(
        None,
        ge=0,
        description="Высота элемента"
    )
    direction: Optional[str] = Field(
        "left",
        description="Направление (left/right)"
    )
    data: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Дополнительные данные"
    )

    @validator("direction")
    def validate_direction(cls, v: Optional[str]) -> Optional[str]:
        """Валидация направления"""
        if v is None:
            return v

        allowed_directions = ["left", "right"]
        if v not in allowed_directions:
            raise ValueError(
                f"Направление должно быть одним из: {', '.join(allowed_directions)}"
            )
        return v


class ZeroLayerResponsiveUpdate(BaseModel):
    """Схема для обновления адаптивных настроек слоя"""

    x: Optional[int] = Field(None, description="Позиция по оси X")
    y: Optional[int] = Field(None, description="Позиция по оси Y")
    width: Optional[int] = Field(None, ge=0, description="Ширина элемента")
    height: Optional[int] = Field(None, ge=0, description="Высота элемента")
    direction: Optional[str] = Field(None, description="Направление")
    data: Optional[Dict[str, Any]] = Field(None, description="Дополнительные данные")

    @validator("direction")
    def validate_direction(cls, v: Optional[str]) -> Optional[str]:
        """Валидация направления"""
        if v is None:
            return v

        allowed_directions = ["left", "right"]
        if v not in allowed_directions:
            raise ValueError(
                f"Направление должно быть одним из: {', '.join(allowed_directions)}"
            )
        return v


class ZeroLayerResponsiveResponse(BaseModel):
    """Схема ответа с адаптивными настройками слоя"""

    id: int
    zero_layer_id: int
    zero_block_responsive_id: int
    x: Optional[int]
    y: Optional[int]
    width: Optional[int]
    height: Optional[int]
    direction: Optional[str]
    data: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Extended Response Schemas ====================

class ZeroLayerWithResponsiveResponse(ZeroLayerResponse):
    """Расширенная схема слоя с адаптивными настройками"""

    responsive_settings: List[ZeroLayerResponsiveResponse] = []

    class Config:
        from_attributes = True


class ZeroBlockWithLayersResponse(ZeroBlockResponse):
    """Расширенная схема zero-блока со слоями и адаптивными настройками"""

    layers: List[ZeroLayerResponse] = []
    responsive_settings: List[ZeroBlockResponsiveResponse] = []

    class Config:
        from_attributes = True
