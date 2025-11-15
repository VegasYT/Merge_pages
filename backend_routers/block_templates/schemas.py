from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# Схемы для категорий

class BlockTemplateCategoryCreate(BaseModel):
    """Схема для создания категории шаблонов блоков"""

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Название категории"
    )


class BlockTemplateCategoryResponse(BaseModel):
    """Схема ответа с данными категории"""

    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class BlockTemplateCategoryWithCount(BaseModel):
    """Схема категории с количеством шаблонов"""

    id: int
    name: str
    templates_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Схемы для шаблонов блоков

class BlockTemplateCreate(BaseModel):
    """Схема для создания шаблона блока"""

    category_id: int = Field(..., description="ID категории")
    template_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Название класса/компонента на фронтенде"
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Отображаемое название шаблона"
    )
    settings: Optional[Dict[str, Any]] = Field(
        None,
        description="Настройки шаблона"
    )
    default_data: Optional[Dict[str, Any]] = Field(
        None,
        description="Данные по умолчанию"
    )
    preview_url: Optional[str] = Field(
        None,
        description="URL изображения предпросмотра"
    )


class BlockTemplateUpdate(BaseModel):
    """Схема для обновления шаблона блока"""

    category_id: Optional[int] = Field(None, description="ID категории")
    template_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="Название класса/компонента"
    )
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=255,
        description="Отображаемое название"
    )
    settings: Optional[Dict[str, Any]] = Field(None, description="Настройки")
    default_data: Optional[Dict[str, Any]] = Field(None, description="Данные по умолчанию")
    preview_url: Optional[str] = Field(None, description="URL предпросмотра")


class BlockTemplateResponse(BaseModel):
    """Схема ответа с данными шаблона блока"""

    id: int
    category_id: int
    template_name: str
    name: str
    settings: Optional[Dict[str, Any]]
    default_data: Optional[Dict[str, Any]]
    preview_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BlockTemplateWithCategory(BaseModel):
    """Схема шаблона блока с данными категории"""

    id: int
    category_id: int
    category_name: str
    template_name: str
    name: str
    settings: Optional[Dict[str, Any]]
    default_data: Optional[Dict[str, Any]]
    preview_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
