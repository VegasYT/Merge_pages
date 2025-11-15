// Export JSON template
export const exportJSON = (structure, editableStyles, defaultData, templateName, categoryId) => {
  const template = {
    id: Date.now(),
    category_id: categoryId,
    template_name: templateName,
    name: templateName,
    preview_url: 'https://via.placeholder.com/300x200',
    settings: {
      structure,
      editableElements: Object.keys(defaultData),
      editableStyles
    },
    default_data: defaultData
  };

  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${templateName}.json`;
  a.click();
};

// Import JSON template
export const importJSON = (file, callbacks) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        callbacks.setStructure(json.settings.structure || []);
        callbacks.setEditableStyles(json.settings.editableStyles || {});
        callbacks.setDefaultData(json.default_data || {});
        callbacks.setTemplateName(json.template_name || 'CustomBlock');
        callbacks.setCategoryId(json.category_id || 1);
      } catch (err) {
        alert('Ошибка импорта JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }
};
