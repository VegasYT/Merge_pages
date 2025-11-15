from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator, model_validator


class BlockCreate(BaseModel):
    """Схема для создания блока"""

    block_template_id: Optional[int] = Field(
        None,
        description="ID шаблона блока (обязателен для обычных блоков, null для zero-блоков)"
    )
    type: str = Field(
        default="template",
        description="Тип блока (template или zeroblock)"
    )
    position: int = Field(
        default=0,
        ge=0,
        description="Позиция блока на странице"
    )
    settings: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Настройки блока"
    )

    @validator("type")
    def validate_type(cls, v: str) -> str:
        """Валидация типа блока"""
        allowed_types = ["template", "zeroblock"]
        if v not in allowed_types:
            raise ValueError(f"Тип блока должен быть одним из: {', '.join(allowed_types)}")
        return v

    @model_validator(mode='after')
    def validate_block_template_id_with_type(self) -> 'BlockCreate':
        """Валидация block_template_id в зависимости от типа блока"""
        if self.type == "template" and self.block_template_id is None:
            raise ValueError("block_template_id обязателен для блоков типа 'template'")

        if self.type == "zeroblock" and self.block_template_id is not None:
            raise ValueError("block_template_id должен быть null для блоков типа 'zeroblock'")

        return self


class BlockUpdate(BaseModel):
    """Схема для обновления настроек блока"""

    settings: Dict[str, Any] = Field(
        ...,
        description="Обновленные настройки блока"
    )


class BlockPositionUpdate(BaseModel):
    """Схема для обновления позиции блока"""

    position: int = Field(
        ...,
        ge=0,
        description="Новая позиция блока"
    )


class BlockResponse(BaseModel):
    """Схема ответа с данными блока"""

    id: int
    page_id: int
    block_template_id: Optional[int]
    type: str
    position: int
    settings: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlockWithTemplateResponse(BlockResponse):
    """Расширенная схема ответа с данными шаблона блока"""

    template_name: Optional[str] = None
    template_category: Optional[str] = None

    class Config:
        from_attributes = True
